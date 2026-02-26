import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const specialty = searchParams.get('specialty')
  const state = searchParams.get('state')
  const onlineOnly = searchParams.get('online') === 'true'
  const minPrice = searchParams.get('min_price')
  const maxPrice = searchParams.get('max_price')
  const page = parseInt(searchParams.get('page') ?? '1')
  const perPage = parseInt(searchParams.get('per_page') ?? '12')

  let query = supabase
    .from('doctor_profiles')
    .select(`
      *,
      profile:profiles!user_id(full_name, avatar_url, email),
      specialization:specializations(name, slug)
    `, { count: 'exact' })
    .eq('verification_status', 'verified')
    .range((page - 1) * perPage, page * perPage - 1)
    .order('is_online', { ascending: false })
    .order('rating_avg', { ascending: false })

  if (specialty) query = query.eq('specialization_id', specialty)
  if (state) query = query.eq('location_state', state)
  if (onlineOnly) query = query.eq('is_online', true)
  if (minPrice) query = query.gte('one_time_rate', parseFloat(minPrice))
  if (maxPrice) query = query.lte('one_time_rate', parseFloat(maxPrice))

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    count,
    page,
    per_page: perPage,
  })
}
