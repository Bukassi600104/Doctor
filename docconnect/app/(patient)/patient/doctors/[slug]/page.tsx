/* eslint-disable @next/next/no-img-element */
'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  Star, MapPin, Clock, Calendar, Languages, GraduationCap,
  MessageCircle, ArrowLeft, CheckCircle, BadgeCheck,
} from 'lucide-react'
import { OnlineIndicator } from '@/components/OnlineIndicator'
import { VerificationBadge } from '@/components/VerificationBadge'
import { formatNaira } from '@/lib/utils'
import type { DoctorProfile, Profile, Specialization, Review } from '@/types'

type ReviewWithPatient = Omit<Review, 'patient'> & { patient: Pick<Profile, 'full_name' | 'avatar_url'> }
type FullDoctorProfile = DoctorProfile & {
  profile: Profile
  specialization?: Specialization
  reviews?: ReviewWithPatient[]
}

const IMGS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsoQJm5T_pLf1jR57Dow3hL_C4vbpE5t4aSS87Vr4RQqhpq4kBQm7sZIqZSqyMul5sUlJxyEL6Lyp99vY6NBIHxNJiaIBcFCMI26hS2NY6U-4Gwf7iJnMKz52g2pZBYSr744yugA0_CFoMe61KiNJiaxtWYvJZka5Sh3Ia3ZNyLRIHYM4EFeagsp6QC0Yt0k9VPz3uBd7c_jgP2jRRl0h72ehZGebkHKOzb9trQkssA1asxUh3H9iOOmRtiMqdIEQpAH7rUrm9aRV',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBciAu_di7htkpn6yBtTWjqa_TmsUVDr0JwxNHOsVqlU3y-mTKyRF-eOZp33KhM-yMbhlPTsSchCcFhPC4p-fixpvdlkrVA1GVlvL9VBOut_wFPyq0airuQQypsKSHI4XwUIaYqE2GsfMgp6uKiXd8vLjFaEBGlSNfE6iwKk530j8cQ_pWRmOeeLJ0QzE7OcImch102v1kNnqz-C5zK06uwCIg9UOV1M-gFNVi4PRHtKTElYu4G4NbTjjHJcTZYh1MdqhoFbzomvO6i',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAk4j0LCfB8xClsqb1_PZS3sNGhh8uccexYH9V-aTwdUZpDHWhxs4iG7jkqP8zbYDGAZxwkmmO9rszLPIevinQdNAg9sWWv3L16s2W3oKGY9jjzk1ktXFRhsEhlCkTRxQ-cz2vURpfdyb6qGGJ-cGYBhr-KloY3HN9azwlZYzWK1U3tOiAk08QTCtCNr2hgFDeX9W6uoIoBP2dC0SCzt4nw1Juc8kUQJhN3qS8O5fao1dSPeGwO15V3Su2tcNnqP-BZqcYclXdV7jWD',
]

const MOCK_DOCTORS: Record<string, FullDoctorProfile> = {
  'dr-emeka-obi': {
    id: '1', user_id: 'u1', specialization_id: 's1',
    bio: 'Dr. Emeka Obi is a consultant cardiologist with over 12 years of clinical experience in Lagos. He specialises in the management of heart failure, hypertension, coronary artery disease, and cardiac arrhythmias.',
    location_state: 'Lagos', location_city: 'Victoria Island',
    mdcn_number: 'MDCN/12345', verification_status: 'verified',
    one_time_rate: 15000, subscription_rate: 40000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba'], years_experience: 12,
    education: 'MBBS, University of Lagos; FWACP (Cardiology)',
    paystack_subaccount_code: null, slug: 'dr-emeka-obi',
    rating_avg: 4.9, rating_count: 134,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { id: 'u1', role: 'doctor', full_name: 'Emeka Obi', phone: null, avatar_url: IMGS[0], email: 'emeka@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    specialization: { id: 's1', name: 'Cardiology', slug: 'cardiology', description: null, icon: null, parent_id: null },
    reviews: [
      { id: 'r1', doctor_id: '1', patient_id: 'p1', session_id: 's1', rating: 5, comment: 'Dr. Obi was very thorough and patient. Highly recommend!', created_at: '2026-01-15T10:30:00Z', patient: { full_name: 'Adaeze Nwosu', avatar_url: null } },
    ],
  },
  'dr-fatima-sule': {
    id: '2', user_id: 'u2', specialization_id: 's2',
    bio: 'General practitioner passionate about preventive healthcare and family medicine.',
    location_state: 'Abuja', location_city: 'Wuse 2',
    mdcn_number: 'MDCN/67890', verification_status: 'verified',
    one_time_rate: 8000, subscription_rate: 25000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Hausa'], years_experience: 7,
    education: 'MBBS, Ahmadu Bello University',
    paystack_subaccount_code: null, slug: 'dr-fatima-sule',
    rating_avg: 4.7, rating_count: 89,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { id: 'u2', role: 'doctor', full_name: 'Fatima Sule', phone: null, avatar_url: IMGS[1], email: 'fatima@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    specialization: { id: 's2', name: 'General Practice', slug: 'general-practice', description: null, icon: null, parent_id: null },
    reviews: [],
  },
}

function getDefaultDoctor(slug: string): FullDoctorProfile {
  return {
    id: slug, user_id: slug, specialization_id: null,
    bio: 'Experienced medical professional committed to patient-centred care.',
    location_state: 'Nigeria', location_city: null,
    mdcn_number: 'MDCN/00000', verification_status: 'verified',
    one_time_rate: 10000, subscription_rate: 30000,
    is_online: false, last_seen: null,
    languages: ['English'], years_experience: 5,
    education: null, paystack_subaccount_code: null, slug,
    rating_avg: 0, rating_count: 0,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { id: slug, role: 'doctor', full_name: slug.replace('dr-', 'Dr. ').replace(/-/g, ' '), phone: null, avatar_url: null, email: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    reviews: [],
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function PatientDoctorProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const doctor = MOCK_DOCTORS[slug] ?? getDefaultDoctor(slug)
  const name = doctor.profile.full_name
  const initials = getInitials(name)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F8F5F0' }}>
      {/* Back nav */}
      <div className="border-b px-4 py-3 sticky top-0 z-10" style={{ background: 'rgba(248,245,240,0.95)', borderColor: '#E5E7EB' }}>
        <button
          onClick={() => router.push('/patient/dashboard?tab=find-doctor')}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
          style={{ color: '#6B7280' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Find a Doctor
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main */}
          <div className="flex-1 space-y-4">
            {/* Hero */}
            <div className="rounded-2xl bg-white overflow-hidden shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
              <div className="h-24" style={{ background: '#0C4A2F' }}>
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
              <div className="px-5 pb-5">
                <div className="relative -mt-10 mb-3 w-fit">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                    {doctor.profile.avatar_url ? (
                      <img src={doctor.profile.avatar_url} alt={`Dr. ${name}`} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl" style={{ background: '#0C4A2F' }}>{initials}</div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1">
                    <OnlineIndicator isOnline={doctor.is_online} size="md" />
                  </div>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold" style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}>Dr. {name}</h1>
                    {doctor.specialization && <p className="font-semibold mt-0.5" style={{ color: '#0C6B4E' }}>{doctor.specialization.name}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-3 text-sm" style={{ color: '#6B7280' }}>
                      {doctor.location_city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{doctor.location_city}, {doctor.location_state}</span>}
                      {doctor.years_experience && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{doctor.years_experience} years exp.</span>}
                      {doctor.rating_count > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{doctor.rating_avg.toFixed(1)} ({doctor.rating_count})</span>}
                    </div>
                  </div>
                  <VerificationBadge status={doctor.verification_status} size="md" />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
              <h2 className="font-semibold mb-2" style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}>About</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{doctor.bio}</p>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {doctor.education && (
                <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                  <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#1C1917' }}>
                    <GraduationCap className="w-4 h-4" style={{ color: '#0C6B4E' }} />Education
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{doctor.education}</p>
                </div>
              )}
              <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#1C1917' }}>
                  <Languages className="w-4 h-4" style={{ color: '#0C6B4E' }} />Languages
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: '#E8F5EE', color: '#0C4A2F' }}>{lang}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#1C1917' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#0C6B4E' }} />Availability
                </div>
                <OnlineIndicator isOnline={doctor.is_online} showLabel size="md" />
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#1C1917' }}>
                  <BadgeCheck className="w-4 h-4 text-green-600" />MDCN Registration
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Reg. No: <span className="font-mono" style={{ color: '#1C1917' }}>{doctor.mdcn_number}</span></p>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" />Verified by DocConnect
                </div>
              </div>
            </div>

            {/* Reviews */}
            {(doctor.reviews?.length ?? 0) > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold" style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}>
                    Reviews ({doctor.rating_count})
                  </h2>
                  <div className="flex items-center gap-2">
                    <StarRating rating={doctor.rating_avg} />
                    <span className="font-bold" style={{ color: '#1C1917' }}>{doctor.rating_avg.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {doctor.reviews?.map((review) => (
                    <div key={review.id} className="pb-4 last:pb-0" style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: '#0C4A2F' }}>
                          {getInitials(review.patient.full_name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm" style={{ color: '#1C1917' }}>{review.patient.full_name}</p>
                            <StarRating rating={review.rating} />
                          </div>
                          {review.comment && <p className="mt-1 text-sm leading-relaxed" style={{ color: '#6B7280' }}>{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-sm space-y-4" style={{ border: '1.5px solid #E5E7EB' }}>
              <h3 className="font-semibold text-lg" style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}>Book a Consultation</h3>
              <OnlineIndicator isOnline={doctor.is_online} showLabel size="sm" />

              {doctor.one_time_rate && (
                <div className="rounded-xl p-4 space-y-3" style={{ border: '1.5px solid #E5E7EB' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold" style={{ color: '#1C1917' }}>{formatNaira(doctor.one_time_rate)}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>One-time session</p>
                    </div>
                    <MessageCircle className="w-5 h-5" style={{ color: '#0C6B4E' }} />
                  </div>
                  <button
                    className="flex items-center justify-center w-full h-10 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: '#0C4A2F' }}
                    onClick={() => { /* TODO: payment flow */ }}
                  >
                    Book One-Time Session
                  </button>
                </div>
              )}

              {doctor.subscription_rate && (
                <div className="rounded-xl p-4 space-y-3" style={{ border: '1.5px solid rgba(12,74,47,0.25)', background: 'rgba(12,74,47,0.04)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold" style={{ color: '#1C1917' }}>
                        {formatNaira(doctor.subscription_rate)}<span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>/mo</span>
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>Monthly subscription</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: '#D4A017' }}>Best value</span>
                  </div>
                  <button
                    className="flex items-center justify-center w-full h-10 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-colors"
                    style={{ background: '#C0392B' }}
                    onClick={() => { /* TODO: payment flow */ }}
                  >
                    Subscribe ₦{(doctor.subscription_rate / 1000).toFixed(0)}k/month
                  </button>
                </div>
              )}

              <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>Payments secured by Paystack</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
