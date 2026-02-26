/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, MapPin, Wifi } from 'lucide-react'
import { DoctorCard } from '@/components/DoctorCard'
import type { DoctorProfile, Profile, Specialization } from '@/types'

// ── Placeholder image pool (same source as home page) ─────────────────────────

const IMGS = [
  // Male 1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsoQJm5T_pLf1jR57Dow3hL_C4vbpE5t4aSS87Vr4RQqhpq4kBQm7sZIqZSqyMul5sUlJxyEL6Lyp99vY6NBIHxNJiaIBcFCMI26hS2NY6U-4Gwf7iJnMKz52g2pZBYSr744yugA0_CFoMe61KiNJiaxtWYvJZka5Sh3Ia3ZNyLRIHYM4EFeagsp6QC0Yt0k9VPz3uBd7c_jgP2jRRl0h72ehZGebkHKOzb9trQkssA1asxUh3H9iOOmRtiMqdIEQpAH7rUrm9aRV',
  // Female 1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBciAu_di7htkpn6yBtTWjqa_TmsUVDr0JwxNHOsVqlU3y-mTKyRF-eOZp33KhM-yMbhlPTsSchCcFhPC4p-fixpvdlkrVA1GVlvL9VBOut_wFPyq0airuQQypsKSHI4XwUIaYqE2GsfMgp6uKiXd8vLjFaEBGlSNfE6iwKk530j8cQ_pWRmOeeLJ0QzE7OcImch102v1kNnqz-C5zK06uwCIg9UOV1M-gFNVi4PRHtKTElYu4G4NbTjjHJcTZYh1MdqhoFbzomvO6i',
  // Male 2
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAk4j0LCfB8xClsqb1_PZS3sNGhh8uccexYH9V-aTwdUZpDHWhxs4iG7jkqP8zbYDGAZxwkmmO9rszLPIevinQdNAg9sWWv3L16s2W3oKGY9jjzk1ktXFRhsEhlCkTRxQ-cz2vURpfdyb6qGGJ-cGYBhr-KloY3HN9azwlZYzWK1U3tOiAk08QTCtCNr2hgFDeX9W6uoIoBP2dC0SCzt4nw1Juc8kUQJhN3qS8O5fao1dSPeGwO15V3Su2tcNnqP-BZqcYclXdV7jWD',
  // Female 2
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3DXqyrT8dZPkadL7_Zsr7fnTWA-2YbKYjbtDqczzjvioISY9u8h4_kr9e69yrZJN6Bndwil9zxNqAQOB5RnqTQWx-aLob-h9AXqAD2fSsWAH1jy87AEb2-KjzcTl8CeS638HBB9F-oHr7LNokwgJA0wx3ue2rSzGH8-T3D2aQAprLhbaogpYbpfJunSb-5-1jHJ1s8SoOUJmt6jJMKTl9vzvWiO7DZ5mpLt0TOTFE3dmPTUUUwIdqV8amVWcbaKSg7E61CEvVDuzD',
]

// ── Types ─────────────────────────────────────────────────────────────────────

type DoctorWithRelations = DoctorProfile & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'>
  specialization?: Pick<Specialization, 'name'>
}

// ── Mock data (with placeholder images) ───────────────────────────────────────

const MOCK_DOCTORS: DoctorWithRelations[] = [
  {
    id: '1', user_id: 'u1', specialization_id: 's1',
    bio: 'Experienced cardiologist with 12 years in practice. Specialises in heart failure and hypertension management.',
    location_state: 'Lagos', location_city: 'Victoria Island',
    mdcn_number: 'MDCN/12345', verification_status: 'verified',
    one_time_rate: 15000, subscription_rate: 40000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba'], years_experience: 12,
    education: 'MBBS, University of Lagos; FWACP (Cardiology)',
    paystack_subaccount_code: null, slug: 'dr-emeka-obi',
    rating_avg: 4.9, rating_count: 134,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Emeka Obi', avatar_url: IMGS[0] },
    specialization: { name: 'Cardiology' },
  },
  {
    id: '2', user_id: 'u2', specialization_id: 's2',
    bio: 'General practitioner passionate about preventive healthcare and chronic disease management.',
    location_state: 'Abuja', location_city: 'Wuse 2',
    mdcn_number: 'MDCN/67890', verification_status: 'verified',
    one_time_rate: 8000, subscription_rate: 25000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Hausa'], years_experience: 7,
    education: 'MBBS, Ahmadu Bello University',
    paystack_subaccount_code: null, slug: 'dr-fatima-sule',
    rating_avg: 4.7, rating_count: 89,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Fatima Sule', avatar_url: IMGS[1] },
    specialization: { name: 'General Practice' },
  },
  {
    id: '3', user_id: 'u3', specialization_id: 's3',
    bio: 'Paediatrician with a special interest in neonatal care and childhood nutrition.',
    location_state: 'Rivers', location_city: 'Port Harcourt',
    mdcn_number: 'MDCN/11223', verification_status: 'verified',
    one_time_rate: 12000, subscription_rate: 35000,
    is_online: false, last_seen: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    languages: ['English', 'Igbo'], years_experience: 9,
    education: 'MBBS, University of Port Harcourt; FWACP (Paediatrics)',
    paystack_subaccount_code: null, slug: 'dr-chidi-eze',
    rating_avg: 4.8, rating_count: 62,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Chidi Eze', avatar_url: IMGS[2] },
    specialization: { name: 'Paediatrics' },
  },
  {
    id: '4', user_id: 'u4', specialization_id: 's4',
    bio: 'Dermatologist specialising in acne, hyperpigmentation, and hair loss treatment.',
    location_state: 'Lagos', location_city: 'Lekki',
    mdcn_number: 'MDCN/44556', verification_status: 'verified',
    one_time_rate: 18000, subscription_rate: 50000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English'], years_experience: 6,
    education: 'MBBS, University of Lagos; FMCP (Dermatology)',
    paystack_subaccount_code: null, slug: 'dr-aisha-bello',
    rating_avg: 4.9, rating_count: 201,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Aisha Bello', avatar_url: IMGS[3] },
    specialization: { name: 'Dermatology' },
  },
  {
    id: '5', user_id: 'u5', specialization_id: 's5',
    bio: 'Psychiatrist focused on anxiety, depression, and trauma-informed care.',
    location_state: 'Oyo', location_city: 'Ibadan',
    mdcn_number: 'MDCN/78901', verification_status: 'verified',
    one_time_rate: 20000, subscription_rate: 55000,
    is_online: false, last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    languages: ['English', 'Yoruba'], years_experience: 14,
    education: 'MBBS, University of Ibadan; FRCPsych',
    paystack_subaccount_code: null, slug: 'dr-tunde-adeyemi',
    rating_avg: 5.0, rating_count: 47,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Tunde Adeyemi', avatar_url: IMGS[0] },
    specialization: { name: 'Psychiatry' },
  },
  {
    id: '6', user_id: 'u6', specialization_id: 's6',
    bio: "Gynaecologist offering antenatal care, family planning, and women's health consultations.",
    location_state: 'Lagos', location_city: 'Ikeja',
    mdcn_number: 'MDCN/33211', verification_status: 'verified',
    one_time_rate: 14000, subscription_rate: 45000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba'], years_experience: 10,
    education: 'MBBS, Obafemi Awolowo University; FWACS (Obs/Gyn)',
    paystack_subaccount_code: null, slug: 'dr-ngozi-okafor',
    rating_avg: 4.8, rating_count: 178,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Ngozi Okafor', avatar_url: IMGS[1] },
    specialization: { name: 'Gynaecology' },
  },
]

const SPECIALTIES = [
  'All Specialties',
  'Cardiology', 'Dermatology', 'General Practice', 'Gynaecology',
  'Neurology', 'Ophthalmology', 'Paediatrics', 'Psychiatry', 'Surgery',
]

const STATES = [
  'All States',
  'Abia', 'Abuja', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// ── Main component ─────────────────────────────────────────────────────────────

export function DoctorsClient() {
  const [specialty, setSpecialty] = useState('All Specialties')
  const [locationState, setLocationState] = useState('All States')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState(100000)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return MOCK_DOCTORS.filter((d) => {
      if (specialty !== 'All Specialties' && d.specialization?.name !== specialty) return false
      if (locationState !== 'All States' && d.location_state !== locationState) return false
      if (onlineOnly && !d.is_online) return false
      if (d.one_time_rate && d.one_time_rate > maxPrice) return false
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = d.profile.full_name.toLowerCase().includes(q)
        const specMatch = d.specialization?.name.toLowerCase().includes(q) ?? false
        const bioMatch = d.bio?.toLowerCase().includes(q) ?? false
        if (!nameMatch && !specMatch && !bioMatch) return false
      }
      return true
    })
  }, [specialty, locationState, onlineOnly, maxPrice, search])

  const onlineDoctors = MOCK_DOCTORS.filter((d) => d.is_online).length

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div style={{ background: '#F5EFE4', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-sm mb-3">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
            <span style={{ color: '#16A34A', fontWeight: 600, fontSize: '0.8rem' }}>{onlineDoctors} doctors online now</span>
          </div>
          <h1 style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1C1917', marginBottom: '0.75rem' }}>
            Find Your Doctor
          </h1>
          <p style={{ color: '#6B7280', maxWidth: '36rem', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Browse MDCN-verified doctors across 24 specialties. See who&apos;s available
            right now and start a consultation in minutes.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialty or condition…"
              className="w-full pl-10 pr-4 h-11 rounded-xl text-sm outline-none transition-all border border-slate-200 bg-white text-slate-900 focus:border-[#0C6B4E] focus:ring-2 focus:ring-[#0C6B4E]/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Filters sidebar ── */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20 space-y-5" style={{ background: '#fff', borderRadius: '1.25rem', border: '1.5px solid #E5E7EB', padding: '1.25rem' }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 600, color: '#1C1917', fontSize: '0.9rem' }}>
                <SlidersHorizontal size={15} style={{ color: '#0C4A2F' }} />
                Filters
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1C1917', display: 'block' }}>Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-9 rounded-lg px-3 text-sm outline-none"
                  style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin size={12} style={{ color: '#9CA3AF' }} /> State
                </label>
                <select
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  className="w-full h-9 rounded-lg px-3 text-sm outline-none"
                  style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1C1917', display: 'block' }}>
                  Max session price: <span style={{ color: '#0C4A2F' }}>₦{maxPrice.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={2000}
                  max={100000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#0C4A2F' }}
                />
                <div className="flex justify-between" style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                  <span>₦2,000</span><span>₦100,000</span>
                </div>
              </div>

              {/* Online only toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="online-toggle"
                  style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}
                >
                  <Wifi size={12} style={{ color: onlineOnly ? '#16A34A' : '#9CA3AF' }} />
                  Online only
                </label>
                <button
                  id="online-toggle"
                  type="button"
                  onClick={() => setOnlineOnly((v) => !v)}
                  aria-pressed={onlineOnly}
                  aria-label="Toggle online only filter"
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: '9999px',
                    background: onlineOnly ? '#16A34A' : '#E5E7EB',
                    position: 'relative',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 2,
                    left: onlineOnly ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s ease',
                  }} />
                </button>
              </div>

              {/* Reset */}
              <button
                type="button"
                onClick={() => {
                  setSpecialty('All Specialties')
                  setLocationState('All States')
                  setOnlineOnly(false)
                  setMaxPrice(100000)
                  setSearch('')
                }}
                className="w-full h-9 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* ── Doctor grid ── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                Showing <span style={{ fontWeight: 700, color: '#1C1917' }}>{filtered.length}</span> doctors
                {onlineOnly && <span style={{ color: '#16A34A', fontWeight: 500 }}> · Online only</span>}
              </p>
              <select className="h-8 rounded-lg px-3 text-xs outline-none"
                style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#1C1917' }}>
                <option>Sort: Relevance</option>
                <option>Sort: Price (low → high)</option>
                <option>Sort: Price (high → low)</option>
                <option>Sort: Rating</option>
                <option>Sort: Online first</option>
              </select>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1C1917', marginBottom: '0.5rem' }}>
                  No doctors found
                </p>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}

            {/* Pagination placeholder */}
            {filtered.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button disabled className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground disabled:opacity-50">
                  Previous
                </button>
                <span className="h-9 w-9 flex items-center justify-center rounded-lg text-white text-sm font-medium" style={{ background: '#0C4A2F' }}>
                  1
                </span>
                <button disabled className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-sm disabled:opacity-50">
                  2
                </button>
                <button disabled className="h-9 px-4 rounded-lg border border-border text-sm disabled:opacity-50">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
