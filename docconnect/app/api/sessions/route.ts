import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'

const PLATFORM_FEE_PCT = 0.30

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { doctor_id, session_type } = body

  // Get doctor rates
  const { data: doctor, error: doctorErr } = await supabase
    .from('doctor_profiles')
    .select('id, one_time_rate, subscription_rate, paystack_subaccount_code, user_id')
    .eq('id', doctor_id)
    .eq('verification_status', 'verified')
    .single()

  if (doctorErr || !doctor) {
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
  }

  const amount = session_type === 'subscription'
    ? doctor.subscription_rate
    : doctor.one_time_rate

  if (!amount) {
    return NextResponse.json({ error: 'Doctor has not set rates' }, { status: 400 })
  }

  const platform_fee = amount * PLATFORM_FEE_PCT

  // Get patient profile for email
  const { data: patient } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
  }

  // Create pending session
  const { data: session, error: sessionErr } = await supabase
    .from('chat_sessions')
    .insert({
      doctor_id,
      patient_id: user.id,
      session_type,
      status: 'pending',
      payment_status: 'pending',
      amount,
      platform_fee,
    })
    .select()
    .single()

  if (sessionErr || !session) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  // Initialize Paystack transaction
  const reference = `dc_${session.id}_${Date.now()}`
  const amountInKobo = Math.round(amount * 100)
  const platformFeeInKobo = Math.round(platform_fee * 100)

  const paystackParams: Parameters<typeof initializeTransaction>[0] = {
    email: patient.email,
    amount: amountInKobo,
    reference,
    metadata: { session_id: session.id, doctor_id, patient_id: user.id },
  }

  if (doctor.paystack_subaccount_code) {
    paystackParams.subaccount = doctor.paystack_subaccount_code
    paystackParams.transaction_charge = platformFeeInKobo
  }

  const paystackRes = await initializeTransaction(paystackParams)

  if (!paystackRes.status) {
    // Cleanup session on Paystack failure
    await supabase.from('chat_sessions').delete().eq('id', session.id)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }

  // Store payment record
  await supabase.from('payments').insert({
    session_id: session.id,
    paystack_ref: reference,
    amount,
    platform_cut: platform_fee,
    doctor_cut: amount - platform_fee,
    status: 'pending',
  })

  return NextResponse.json({
    session_id: session.id,
    payment_url: paystackRes.data.authorization_url,
    reference,
  })
}
