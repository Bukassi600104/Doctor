import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ─── Paystack Webhook Handler ─────────────────────────────────────────────────
//
// Events handled:
//   - charge.success    → activate chat session, mark payment success
//   - subscription.create  → record subscription, mark patient subscribed
//   - subscription.disable → deactivate subscription
//
// Docs: https://paystack.com/docs/payments/webhooks

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  // ── Signature Verification ──────────────────────────────────────────────────
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')

  if (hash !== signature) {
    console.error('[Paystack Webhook] Invalid signature — possible spoofed request')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ── Parse Event ─────────────────────────────────────────────────────────────
  let event: {
    event: string
    data: {
      reference: string
      amount: number
      status: string
      customer?: { email: string }
      metadata?: Record<string, unknown>
      subscription_code?: string
      plan?: { plan_code: string }
    }
  }

  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── Supabase Client (service role — bypasses RLS) ──────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Handle charge.success ──────────────────────────────────────────────────
  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data
    const sessionId = metadata?.session_id as string | undefined
    const patientId = metadata?.patient_id as string | undefined
    const doctorId = metadata?.doctor_id as string | undefined

    if (sessionId) {
      // Mark payment record as successful
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('paystack_ref', reference)

      if (paymentError) {
        console.error('[Paystack Webhook] Failed to update payment:', paymentError)
      }

      // Activate the chat session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .update({ status: 'active', payment_status: 'success' })
        .eq('id', sessionId)

      if (sessionError) {
        console.error('[Paystack Webhook] Failed to activate chat session:', sessionError)
      }

      console.log(
        `[Paystack Webhook] charge.success — session ${sessionId} activated (ref: ${reference})`
      )
    } else {
      // Log unknown charge (e.g. manual top-up)
      console.warn('[Paystack Webhook] charge.success with no session_id in metadata', {
        reference,
        patientId,
        doctorId,
      })
    }
  }

  // ── Handle subscription.create ─────────────────────────────────────────────
  if (event.event === 'subscription.create') {
    const { metadata, subscription_code, plan } = event.data
    const patientId = metadata?.patient_id as string | undefined
    const doctorId = metadata?.doctor_id as string | undefined

    if (patientId && doctorId && subscription_code) {
      const { error } = await supabase.from('subscriptions').insert({
        patient_id: patientId,
        doctor_id: doctorId,
        paystack_sub_code: subscription_code,
        paystack_plan_code: plan?.plan_code ?? null,
        plan_amount: event.data.amount / 100,
        status: 'active',
      })

      if (error) {
        console.error('[Paystack Webhook] Failed to record subscription:', error)
      } else {
        console.log(`[Paystack Webhook] subscription.create — ${subscription_code} recorded`)
      }
    }
  }

  // ── Handle subscription.disable ───────────────────────────────────────────
  if (event.event === 'subscription.disable') {
    const { subscription_code } = event.data

    if (subscription_code) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('paystack_sub_code', subscription_code)

      if (error) {
        console.error('[Paystack Webhook] Failed to cancel subscription:', error)
      } else {
        console.log(`[Paystack Webhook] subscription.disable — ${subscription_code} cancelled`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
