/**
 * /doctors — Doctor listing page (Server Component + placeholder data)
 *
 * TODO: Replace MOCK_DOCTORS with a real Supabase query once DB is seeded.
 * Shape must match DoctorProfile & { profile: { full_name, avatar_url }, specialization }
 */

import type { Metadata } from 'next'
import { Search, SlidersHorizontal, MapPin, Wifi } from 'lucide-react'
import { DoctorCard } from '@/components/DoctorCard'
import type { DoctorProfile, Profile, Specialization } from '@/types'

export const metadata: Metadata = {
  title: 'Find a Doctor',
  description: 'Search MDCN-verified Nigerian doctors by specialty, location and availability.',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DoctorWithRelations = DoctorProfile & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'>
  specialization?: Pick<Specialization, 'name'>
}

// ── Placeholder data (replace with DB query) ─────────────────────────────────

const MOCK_DOCTORS: DoctorWithRelations[] = [
  {
    id: '1',
    user_id: 'u1',
    specialization_id: 's1',
    bio: 'Experienced cardiologist with 12 years in practice. Specialises in heart failure and hypertension management.',
    location_state: 'Lagos',
    location_city: 'Victoria Island',
    mdcn_number: 'MDCN/12345',
    verification_status: 'verified',
    one_time_rate: 15000,
    subscription_rate: 40000,
    is_online: true,
    last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba'],
    years_experience: 12,
    education: 'MBBS, University of Lagos; FWACP (Cardiology)',
    paystack_subaccount_code: null,
    slug: 'dr-emeka-obi',
    rating_avg: 4.9,
    rating_count: 134,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Emeka Obi', avatar_url: null },
    specialization: { name: 'Cardiology' },
  },
  {
    id: '2',
    user_id: 'u2',
    specialization_id: 's2',
    bio: 'General practitioner passionate about preventive healthcare and chronic disease management.',
    location_state: 'Abuja',
    location_city: 'Wuse 2',
    mdcn_number: 'MDCN/67890',
    verification_status: 'verified',
    one_time_rate: 8000,
    subscription_rate: 25000,
    is_online: true,
    last_seen: new Date().toISOString(),
    languages: ['English', 'Hausa'],
    years_experience: 7,
    education: 'MBBS, Ahmadu Bello University',
    paystack_subaccount_code: null,
    slug: 'dr-fatima-sule',
    rating_avg: 4.7,
    rating_count: 89,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Fatima Sule', avatar_url: null },
    specialization: { name: 'General Practice' },
  },
  {
    id: '3',
    user_id: 'u3',
    specialization_id: 's3',
    bio: 'Paediatrician with a special interest in neonatal care and childhood nutrition.',
    location_state: 'Rivers',
    location_city: 'Port Harcourt',
    mdcn_number: 'MDCN/11223',
    verification_status: 'verified',
    one_time_rate: 12000,
    subscription_rate: 35000,
    is_online: false,
    last_seen: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    languages: ['English', 'Igbo'],
    years_experience: 9,
    education: 'MBBS, University of Port Harcourt; FWACP (Paediatrics)',
    paystack_subaccount_code: null,
    slug: 'dr-chidi-eze',
    rating_avg: 4.8,
    rating_count: 62,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Chidi Eze', avatar_url: null },
    specialization: { name: 'Paediatrics' },
  },
  {
    id: '4',
    user_id: 'u4',
    specialization_id: 's4',
    bio: 'Dermatologist specialising in acne, hyperpigmentation, and hair loss treatment.',
    location_state: 'Lagos',
    location_city: 'Lekki',
    mdcn_number: 'MDCN/44556',
    verification_status: 'verified',
    one_time_rate: 18000,
    subscription_rate: 50000,
    is_online: true,
    last_seen: new Date().toISOString(),
    languages: ['English'],
    years_experience: 6,
    education: 'MBBS, University of Lagos; FMCP (Dermatology)',
    paystack_subaccount_code: null,
    slug: 'dr-aisha-bello',
    rating_avg: 4.9,
    rating_count: 201,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Aisha Bello', avatar_url: null },
    specialization: { name: 'Dermatology' },
  },
  {
    id: '5',
    user_id: 'u5',
    specialization_id: 's5',
    bio: 'Psychiatrist focused on anxiety, depression, and trauma-informed care.',
    location_state: 'Oyo',
    location_city: 'Ibadan',
    mdcn_number: 'MDCN/78901',
    verification_status: 'verified',
    one_time_rate: 20000,
    subscription_rate: 55000,
    is_online: false,
    last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    languages: ['English', 'Yoruba'],
    years_experience: 14,
    education: 'MBBS, University of Ibadan; FRCPsych',
    paystack_subaccount_code: null,
    slug: 'dr-tunde-adeyemi',
    rating_avg: 5.0,
    rating_count: 47,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Tunde Adeyemi', avatar_url: null },
    specialization: { name: 'Psychiatry' },
  },
  {
    id: '6',
    user_id: 'u6',
    specialization_id: 's6',
    bio: 'Gynaecologist offering antenatal care, family planning, and women\'s health consultations.',
    location_state: 'Lagos',
    location_city: 'Ikeja',
    mdcn_number: 'MDCN/33211',
    verification_status: 'verified',
    one_time_rate: 14000,
    subscription_rate: 45000,
    is_online: true,
    last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba'],
    years_experience: 10,
    education: 'MBBS, Obafemi Awolowo University; FWACS (Obs/Gyn)',
    paystack_subaccount_code: null,
    slug: 'dr-ngozi-okafor',
    rating_avg: 4.8,
    rating_count: 178,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Ngozi Okafor', avatar_url: null },
    specialization: { name: 'Gynaecology' },
  },
]

const SPECIALTIES = [
  'All Specialties',
  'Cardiology',
  'Dermatology',
  'General Practice',
  'Gynaecology',
  'Neurology',
  'Ophthalmology',
  'Paediatrics',
  'Psychiatry',
  'Surgery',
]

const STATES = [
  'All States',
  'Abia', 'Abuja', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const onlineDoctors = MOCK_DOCTORS.filter((d) => d.is_online).length

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div style={{ background: "#F5EFE4", borderBottom: "1px solid #E5E7EB" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-sm mb-3">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
            <span style={{ color: "#16A34A", fontWeight: 600, fontSize: "0.8rem" }}>{onlineDoctors} doctors online now</span>
          </div>
          <h1 style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "#1C1917", marginBottom: "0.75rem" }}>
            Find Your Doctor
          </h1>
          <p style={{ color: "#6B7280", maxWidth: "36rem", marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.7 }}>
            Browse MDCN-verified doctors across 24 specialties. See who&apos;s available
            right now and start a consultation in minutes.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#9CA3AF" }} />
            <input
              type="search"
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
            <div className="sticky top-20 space-y-5" style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #E5E7EB", padding: "1.25rem" }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 600, color: "#1C1917", fontSize: "0.9rem" }}>
                <SlidersHorizontal size={15} style={{ color: "#0C4A2F" }} />
                Filters
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#1C1917", display: "block" }}>Specialty</label>
                <select className="w-full h-9 rounded-lg px-3 text-sm outline-none" style={{ border: "1.5px solid #E5E7EB", background: "#fff" }}>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s === 'All Specialties' ? '' : s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#1C1917", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <MapPin size={12} style={{ color: "#9CA3AF" }} /> State
                </label>
                <select className="w-full h-9 rounded-lg px-3 text-sm outline-none" style={{ border: "1.5px solid #E5E7EB", background: "#fff" }}>
                  {STATES.map((s) => (
                    <option key={s} value={s === 'All States' ? '' : s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#1C1917", display: "block" }}>Max session price</label>
                <input type="range" min={2000} max={100000} step={1000} defaultValue={50000}
                  className="w-full" style={{ accentColor: "#0C4A2F" }} />
                <div className="flex justify-between" style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
                  <span>₦2,000</span><span>₦100,000</span>
                </div>
              </div>

              {/* Online toggle */}
              <div className="flex items-center justify-between">
                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#1C1917", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <Wifi size={12} style={{ color: "#16A34A" }} /> Online only
                </label>
                <div style={{ width: 36, height: 20, borderRadius: "9999px", background: "#E5E7EB", position: "relative", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: 2, left: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>

              {/* Apply */}
              <button className="w-full h-9 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: "#0C4A2F", color: "#fff" }}>
                Apply Filters
              </button>
            </div>
          </aside>

          {/* ── Doctor grid ── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>
                Showing <span style={{ fontWeight: 700, color: "#1C1917" }}>{MOCK_DOCTORS.length}</span> doctors
              </p>
              <select className="h-8 rounded-lg px-3 text-xs outline-none"
                style={{ border: "1.5px solid #E5E7EB", background: "#fff", color: "#1C1917" }}>
                <option>Sort: Relevance</option>
                <option>Sort: Price (low → high)</option>
                <option>Sort: Price (high → low)</option>
                <option>Sort: Rating</option>
                <option>Sort: Online first</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {MOCK_DOCTORS.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>

            {/* Placeholder pagination */}
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled
                className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground disabled:opacity-50"
              >
                Previous
              </button>
              <span className="h-9 w-9 flex items-center justify-center rounded-lg gradient-brand text-white text-sm font-medium">
                1
              </span>
              <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                2
              </button>
              <button className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
