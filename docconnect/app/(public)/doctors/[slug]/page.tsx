/**
 * /doctors/[slug] — Doctor profile page (Server Component + placeholder data)
 *
 * TODO: Replace getMockDoctor() with a real Supabase query on `doctor_profiles`
 *       joined with `profiles`, `specializations`, and `reviews`.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Languages,
  GraduationCap,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  BadgeCheck,
} from 'lucide-react'
import { OnlineIndicator } from '@/components/OnlineIndicator'
import { VerificationBadge } from '@/components/VerificationBadge'
import { formatNaira } from '@/lib/utils'
import type { DoctorProfile, Profile, Specialization, Review } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type ReviewWithPatient = Omit<Review, 'patient'> & { patient: Pick<Profile, 'full_name' | 'avatar_url'> }

type FullDoctorProfile = DoctorProfile & {
  profile: Profile
  specialization?: Specialization
  reviews?: ReviewWithPatient[]
}

// ── Placeholder data ──────────────────────────────────────────────────────────

function getMockDoctor(_slug: string): FullDoctorProfile {
  return {
    id: '1',
    user_id: 'u1',
    specialization_id: 's1',
    bio: 'Dr. Emeka Obi is a consultant cardiologist with over 12 years of clinical experience in Lagos. He specialises in the management of heart failure, hypertension, coronary artery disease, and cardiac arrhythmias. He completed his MBBS at the University of Lagos and his Fellowship training (FWACP) at Lagos University Teaching Hospital (LUTH). Dr. Obi believes in patient-centred care and takes time to explain diagnoses and treatment plans clearly to every patient.',
    location_state: 'Lagos',
    location_city: 'Victoria Island',
    mdcn_number: 'MDCN/12345',
    verification_status: 'verified',
    one_time_rate: 15000,
    subscription_rate: 40000,
    is_online: true,
    last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba', 'Igbo'],
    years_experience: 12,
    education: 'MBBS, University of Lagos (2009); FWACP Cardiology, LUTH (2016); Diploma in Echocardiography, UCL London (2018)',
    paystack_subaccount_code: null,
    slug: 'dr-emeka-obi',
    rating_avg: 4.9,
    rating_count: 134,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: {
      id: 'u1',
      role: 'doctor',
      full_name: 'Emeka Obi',
      phone: null,
      avatar_url: null,
      email: 'emeka@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    specialization: {
      id: 's1',
      name: 'Cardiology',
      slug: 'cardiology',
      description: 'Heart and cardiovascular system specialists',
      icon: null,
      parent_id: null,
    },
    reviews: [
      {
        id: 'r1',
        doctor_id: '1',
        patient_id: 'p1',
        session_id: 'sess1',
        rating: 5,
        comment: 'Dr. Obi was very thorough and patient. He explained my condition clearly and the advice he gave has made a real difference. Highly recommend!',
        created_at: '2026-01-15T10:30:00Z',
        patient: { full_name: 'Adaeze Nwosu', avatar_url: null },
      },
      {
        id: 'r2',
        doctor_id: '1',
        patient_id: 'p2',
        session_id: 'sess2',
        rating: 5,
        comment: 'Excellent consultation. Responded quickly and gave detailed explanations. Worth every naira.',
        created_at: '2026-01-10T14:00:00Z',
        patient: { full_name: 'Babatunde Adeola', avatar_url: null },
      },
      {
        id: 'r3',
        doctor_id: '1',
        patient_id: 'p3',
        session_id: 'sess3',
        rating: 4,
        comment: 'Good doctor, very knowledgeable. Response time was a bit slow but overall satisfied.',
        created_at: '2025-12-28T09:00:00Z',
        patient: { full_name: 'Ifeoma Chukwu', avatar_url: null },
      },
    ],
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doctor = getMockDoctor(slug)
  const name = doctor.profile.full_name

  return {
    title: `Dr. ${name} — ${doctor.specialization?.name ?? 'Doctor'}`,
    description: doctor.bio?.slice(0, 160) ?? `Book a consultation with Dr. ${name} on DocConnect.`,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doctor = getMockDoctor(slug)
  const name = doctor.profile.full_name
  const initials = getInitials(name)

  return (
    <div className="min-h-screen" style={{ background: '#F8F5F0' }}>
      {/* Back nav */}
      <div
        className="sticky top-16 z-40 backdrop-blur-md border-b"
        style={{ background: 'rgba(248,245,240,0.92)', borderColor: '#E5E7EB' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#6B7280' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to doctors
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main content ── */}
          <div className="flex-1 space-y-5">

            {/* Hero card */}
            <div className="rounded-2xl bg-white overflow-hidden shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
              {/* Banner */}
              <div className="h-28" style={{ background: '#0C4A2F' }}>
                {/* Subtle dot pattern */}
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="relative -mt-12 mb-4 w-fit">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white"
                    style={{ background: '#0C4A2F' }}
                  >
                    {initials}
                  </div>
                  <div className="absolute bottom-1 right-1">
                    <OnlineIndicator isOnline={doctor.is_online} size="md" />
                  </div>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
                    >
                      Dr. {name}
                    </h1>
                    {doctor.specialization && (
                      <p className="font-semibold mt-0.5" style={{ color: '#0C6B4E' }}>
                        {doctor.specialization.name}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6B7280' }}>
                      {doctor.location_city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {doctor.location_city}, {doctor.location_state}
                        </span>
                      )}
                      {doctor.years_experience && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {doctor.years_experience} years experience
                        </span>
                      )}
                      {doctor.rating_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {doctor.rating_avg.toFixed(1)} ({doctor.rating_count} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                  <VerificationBadge status={doctor.verification_status} size="md" />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
              <h2
                className="font-semibold mb-3"
                style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
              >
                About
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{doctor.bio}</p>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Education */}
              {doctor.education && (
                <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                  <div className="flex items-center gap-2 font-semibold mb-3" style={{ color: '#1C1917' }}>
                    <GraduationCap className="w-4 h-4" style={{ color: '#0C6B4E' }} />
                    Education
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                    {doctor.education}
                  </p>
                </div>
              )}

              {/* Languages */}
              <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 font-semibold mb-3" style={{ color: '#1C1917' }}>
                  <Languages className="w-4 h-4" style={{ color: '#0C6B4E' }} />
                  Languages
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#E8F5EE', color: '#0C4A2F' }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 font-semibold mb-3" style={{ color: '#1C1917' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#0C6B4E' }} />
                  Availability
                </div>
                <div className="flex items-center gap-2">
                  <OnlineIndicator isOnline={doctor.is_online} showLabel size="md" />
                </div>
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                  Typical response time: under 15 minutes when online
                </p>
              </div>

              {/* MDCN verification */}
              <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 font-semibold mb-3" style={{ color: '#1C1917' }}>
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  MDCN Registration
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Reg. No: <span className="font-mono" style={{ color: '#1C1917' }}>{doctor.mdcn_number}</span>
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified by DocConnect team
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-semibold"
                  style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
                >
                  Patient Reviews ({doctor.rating_count})
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={doctor.rating_avg} />
                  <span className="font-bold" style={{ color: '#1C1917' }}>{doctor.rating_avg.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-5">
                {doctor.reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="pb-5 last:pb-0"
                    style={{ borderBottom: '1px solid #F3F4F6' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: '#0C4A2F' }}
                      >
                        {getInitials(review.patient.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm" style={{ color: '#1C1917' }}>
                            {review.patient.full_name}
                          </p>
                          <StarRating rating={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                            {review.comment}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                          {new Date(review.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Booking widget sidebar ── */}
          <aside className="lg:w-80 shrink-0">
            <div
              className="sticky top-32 rounded-2xl bg-white p-6 shadow-sm space-y-4"
              style={{ border: '1.5px solid #E5E7EB' }}
            >
              <h3
                className="font-semibold text-lg"
                style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
              >
                Book a Consultation
              </h3>

              <div className="flex items-center gap-2 text-sm">
                <OnlineIndicator isOnline={doctor.is_online} showLabel size="sm" />
              </div>

              {/* One-time session */}
              {doctor.one_time_rate && (
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ border: '1.5px solid #E5E7EB' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold" style={{ color: '#1C1917' }}>
                        {formatNaira(doctor.one_time_rate)}
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>One-time session</p>
                    </div>
                    <MessageCircle className="w-5 h-5" style={{ color: '#0C6B4E' }} />
                  </div>
                  <ul className="space-y-1.5 text-xs" style={{ color: '#6B7280' }}>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Unlimited messages in session
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Document upload &amp; review
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Valid for 7 days
                    </li>
                  </ul>
                  <Link
                    href="/patient/dashboard"
                    className="flex items-center justify-center w-full h-10 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: '#0C4A2F' }}
                  >
                    Book One-Time Session
                  </Link>
                </div>
              )}

              {/* Subscription */}
              {doctor.subscription_rate && (
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ border: '1.5px solid rgba(12,74,47,0.25)', background: 'rgba(12,74,47,0.04)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold" style={{ color: '#1C1917' }}>
                        {formatNaira(doctor.subscription_rate)}
                        <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}> / month</span>
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>Monthly subscription</p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ background: '#D4A017' }}
                    >
                      Best value
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs" style={{ color: '#6B7280' }}>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Unlimited sessions for 30 days
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Priority response time
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Prescription letters included
                    </li>
                  </ul>
                  <Link
                    href="/patient/dashboard"
                    className="flex items-center justify-center w-full h-10 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-colors"
                    style={{ background: '#C0392B' }}
                  >
                    Subscribe ₦{(doctor.subscription_rate / 1000).toFixed(0)}k / month
                  </Link>
                </div>
              )}

              <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                Payments secured by Paystack · 30-day refund guarantee
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
