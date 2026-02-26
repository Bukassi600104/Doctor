import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Verify the caller is an authenticated admin
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
  }

  // Parse and validate request body
  const body = await request.json()
  const { doctor_profile_id, action, note } = body as {
    doctor_profile_id: string
    action: 'approve' | 'reject'
    note?: string
  }

  if (!doctor_profile_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const newStatus = action === 'approve' ? 'verified' : 'rejected'

  // Use service role to bypass RLS for admin mutations
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Update doctor profile status
  const { error: profileError } = await serviceClient
    .from('doctor_profiles')
    .update({
      verification_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', doctor_profile_id)

  if (profileError) {
    console.error('[Admin Verify] Failed to update doctor profile:', profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Update credential statuses
  const credStatus = action === 'approve' ? 'approved' : 'rejected'
  const { error: credError } = await serviceClient
    .from('credentials')
    .update({
      status: credStatus,
      reviewer_note: note ?? null,
      reviewed_at: new Date().toISOString(),
      reviewer_id: user.id,
    })
    .eq('doctor_id', doctor_profile_id)

  if (credError) {
    console.error('[Admin Verify] Failed to update credentials:', credError)
    // Non-fatal — the profile status is already updated
  }

  console.log(`[Admin Verify] Doctor ${doctor_profile_id} → ${newStatus} by admin ${user.id}`)

  return NextResponse.json({ success: true, status: newStatus })
}
