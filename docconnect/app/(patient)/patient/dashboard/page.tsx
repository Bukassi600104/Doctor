/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  MessageCircle,
  FileText,
  ChevronRight,
  Activity,
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  SlidersHorizontal,
  Wifi,
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { DoctorProfile, Profile, Specialization } from '@/types'

// ── Doctor data (shared with /doctors page) ───────────────────────────────────

const IMGS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsoQJm5T_pLf1jR57Dow3hL_C4vbpE5t4aSS87Vr4RQqhpq4kBQm7sZIqZSqyMul5sUlJxyEL6Lyp99vY6NBIHxNJiaIBcFCMI26hS2NY6U-4Gwf7iJnMKz52g2pZBYSr744yugA0_CFoMe61KiNJiaxtWYvJZka5Sh3Ia3ZNyLRIHYM4EFeagsp6QC0Yt0k9VPz3uBd7c_jgP2jRRl0h72ehZGebkHKOzb9trQkssA1asxUh3H9iOOmRtiMqdIEQpAH7rUrm9aRV',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBciAu_di7htkpn6yBtTWjqa_TmsUVDr0JwxNHOsVqlU3y-mTKyRF-eOZp33KhM-yMbhlPTsSchCcFhPC4p-fixpvdlkrVA1GVlvL9VBOut_wFPyq0airuQQypsKSHI4XwUIaYqE2GsfMgp6uKiXd8vLjFaEBGlSNfE6iwKk530j8cQ_pWRmOeeLJ0QzE7OcImch102v1kNnqz-C5zK06uwCIg9UOV1M-gFNVi4PRHtKTElYu4G4NbTjjHJcTZYh1MdqhoFbzomvO6i',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAk4j0LCfB8xClsqb1_PZS3sNGhh8uccexYH9V-aTwdUZpDHWhxs4iG7jkqP8zbYDGAZxwkmmO9rszLPIevinQdNAg9sWWv3L16s2W3oKGY9jjzk1ktXFRhsEhlCkTRxQ-cz2vURpfdyb6qGGJ-cGYBhr-KloY3HN9azwlZYzWK1U3tOiAk08QTCtCNr2hgFDeX9W6uoIoBP2dC0SCzt4nw1Juc8kUQJhN3qS8O5fao1dSPeGwO15V3Su2tcNnqP-BZqcYclXdV7jWD',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3DXqyrT8dZPkadL7_Zsr7fnTWA-2YbKYjbtDqczzjvioISY9u8h4_kr9e69yrZJN6Bndwil9zxNqAQOB5RnqTQWx-aLob-h9AXqAD2fSsWAH1jy87AEb2-KjzcTl8CeS638HBB9F-oHr7LNokwgJA0wx3ue2rSzGH8-T3D2aQAprLhbaogpYbpfJunSb-5-1jHJ1s8SoOUJmt6jJMKTl9vzvWiO7DZ5mpLt0TOTFE3dmPTUUUwIdqV8amVWcbaKSg7E61CEvVDuzD',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBciAu_di7htkpn6yBtTWjqa_TmsUVDr0JwxNHOsVqlU3y-mTKyRF-eOZp33KhM-yMbhlPTsSchCcFhPC4p-fixpvdlkrVA1GVlvL9VBOut_wFPyq0airuQQypsKSHI4XwUIaYqE2GsfMgp6uKiXd8vLjFaEBGlSNfE6iwKk530j8cQ_pWRmOeeLJ0QzE7OcImch102v1kNnqz-C5zK06uwCIg9UOV1M-gFNVi4PRHtKTElYu4G4NbTjjHJcTZYh1MdqhoFbzomvO6i',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsoQJm5T_pLf1jR57Dow3hL_C4vbpE5t4aSS87Vr4RQqhpq4kBQm7sZIqZSqyMul5sUlJxyEL6Lyp99vY6NBIHxNJiaIBcFCMI26hS2NY6U-4Gwf7iJnMKz52g2pZBYSr744yugA0_CFoMe61KiNJiaxtWYvJZka5Sh3Ia3ZNyLRIHYM4EFeagsp6QC0Yt0k9VPz3uBd7c_jgP2jRRl0h72ehZGebkHKOzb9trQkssA1asxUh3H9iOOmRtiMqdIEQpAH7rUrm9aRV',
]

type DoctorWithRelations = DoctorProfile & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'>
  specialization?: Pick<Specialization, 'name'>
}

const MOCK_DOCTORS: DoctorWithRelations[] = [
  {
    id: '1', user_id: 'u1', specialization_id: 's1',
    bio: 'Experienced cardiologist with 12 years in practice.',
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
    bio: 'General practitioner passionate about preventive healthcare.',
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
    bio: 'Paediatrician with a special interest in neonatal care.',
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
    bio: 'Dermatologist specialising in acne, hyperpigmentation, and hair loss.',
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
    bio: "Gynaecologist offering antenatal care, family planning, and women's health.",
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
  {
    id: '7', user_id: 'u7', specialization_id: 's7',
    bio: 'Endocrinologist specialising in diabetes, thyroid, and hormonal imbalances.',
    location_state: 'Lagos', location_city: 'Surulere',
    mdcn_number: 'MDCN/55123', verification_status: 'verified',
    one_time_rate: 16000, subscription_rate: 48000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Igbo'], years_experience: 11,
    education: 'MBBS, University of Nigeria Nsukka; FMCP (Endocrinology)',
    paystack_subaccount_code: null, slug: 'dr-chiamaka-nwosu',
    rating_avg: 4.9, rating_count: 93,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Chiamaka Nwosu', avatar_url: IMGS[3] },
    specialization: { name: 'Endocrinology' },
  },
  {
    id: '8', user_id: 'u8', specialization_id: 's8',
    bio: 'Ophthalmologist with expertise in glaucoma, cataracts, and refractive surgery.',
    location_state: 'Abuja', location_city: 'Garki',
    mdcn_number: 'MDCN/77344', verification_status: 'verified',
    one_time_rate: 13000, subscription_rate: 38000,
    is_online: false, last_seen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    languages: ['English', 'Hausa'], years_experience: 8,
    education: 'MBBS, University of Maiduguri; FMCOphth',
    paystack_subaccount_code: null, slug: 'dr-halima-usman',
    rating_avg: 4.7, rating_count: 55,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Halima Usman', avatar_url: IMGS[4] },
    specialization: { name: 'Ophthalmology' },
  },
  {
    id: '9', user_id: 'u9', specialization_id: 's9',
    bio: 'Neurologist focused on epilepsy, stroke rehabilitation, and neurodegenerative disorders.',
    location_state: 'Lagos', location_city: 'Yaba',
    mdcn_number: 'MDCN/88201', verification_status: 'verified',
    one_time_rate: 22000, subscription_rate: 60000,
    is_online: true, last_seen: new Date().toISOString(),
    languages: ['English', 'Yoruba'], years_experience: 15,
    education: 'MBBS, University of Lagos; FWACP (Neurology); MSc, UCL London',
    paystack_subaccount_code: null, slug: 'dr-olawale-adeyinka',
    rating_avg: 5.0, rating_count: 38,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Olawale Adeyinka', avatar_url: IMGS[5] },
    specialization: { name: 'Neurology' },
  },
  {
    id: '10', user_id: 'u10', specialization_id: 's10',
    bio: 'Internal medicine physician covering hypertension, diabetes, and complex multi-system disease.',
    location_state: 'Kano', location_city: 'Nasarawa GRA',
    mdcn_number: 'MDCN/66432', verification_status: 'verified',
    one_time_rate: 10000, subscription_rate: 30000,
    is_online: false, last_seen: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    languages: ['English', 'Hausa', 'Fulfulde'], years_experience: 9,
    education: 'MBBS, Bayero University Kano; FMCP (Internal Medicine)',
    paystack_subaccount_code: null, slug: 'dr-fatimah-sani',
    rating_avg: 4.6, rating_count: 72,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    profile: { full_name: 'Fatimah Sani', avatar_url: IMGS[3] },
    specialization: { name: 'Internal Medicine' },
  },
]

const SPECIALTIES = [
  'All Specialties',
  'Cardiology', 'Dermatology', 'Endocrinology', 'General Practice', 'Gynaecology',
  'Internal Medicine', 'Neurology', 'Ophthalmology', 'Paediatrics', 'Psychiatry', 'Surgery',
]

const STATES = [
  'All States',
  'Abia', 'Abuja', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── QuickAction ───────────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  onClick?: () => void
  highlight?: boolean
}

function QuickAction({ icon: Icon, title, description, href, onClick, highlight }: QuickActionProps) {
  const sharedStyle = {
    border: `1.5px solid ${highlight ? 'rgba(12,74,47,0.2)' : '#E5E7EB'}`,
    background: highlight ? 'rgba(12,74,47,0.04)' : '#fff',
  }
  const content = (
    <>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ background: highlight ? '#0C4A2F' : '#F3F4F6' }}
      >
        <Icon className="w-5 h-5" style={{ color: highlight ? '#fff' : '#9CA3AF' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: highlight ? '#0C4A2F' : '#1C1917' }}>
          {title}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0" style={{ color: '#D1D5DB' }} />
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm w-full text-left"
        style={sharedStyle}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      href={href!}
      className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
      style={sharedStyle}
    >
      {content}
    </Link>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md', className)} style={{ background: '#E5E7EB' }} />
  )
}

// ── InlineDoctorCard ──────────────────────────────────────────────────────────

function InlineDoctorCard({
  doctor,
  isFavourite,
  onToggleFavourite,
  onShare,
}: {
  doctor: DoctorWithRelations
  isFavourite: boolean
  onToggleFavourite: (id: string) => void
  onShare: (doctor: DoctorWithRelations) => void
}) {
  const name = doctor.profile.full_name
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-md"
      style={{ border: '1.5px solid #E5E7EB' }}
    >
      {/* Photo strip */}
      <div className="relative h-36 overflow-hidden" style={{ background: '#E8F5EE' }}>
        {doctor.profile.avatar_url ? (
          <img
            src={doctor.profile.avatar_url}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: '#0C4A2F' }}
            >
              {initials}
            </div>
          </div>
        )}
        {/* Online badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white"
          style={{ background: doctor.is_online ? '#16A34A' : '#9CA3AF', fontSize: '0.6rem', fontWeight: 600 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          {doctor.is_online ? 'Online' : 'Offline'}
        </div>
        {/* Action buttons */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => onToggleFavourite(doctor.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart
              className="w-3.5 h-3.5"
              style={{ color: isFavourite ? '#C0392B' : '#9CA3AF', fill: isFavourite ? '#C0392B' : 'none' }}
            />
          </button>
          <button
            type="button"
            onClick={() => onShare(doctor)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            aria-label="Share doctor profile"
          >
            <Share2 className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-bold text-sm" style={{ color: '#1C1917' }}>Dr. {name}</h3>
        {doctor.specialization && (
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#0C4A2F' }}>
            {doctor.specialization.name}
          </p>
        )}
        {doctor.location_state && (
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#9CA3AF' }}>
            <MapPin className="w-2.5 h-2.5" />
            {doctor.location_city ?? doctor.location_state}
          </p>
        )}

        <div className="flex items-center justify-between mt-2 mb-3">
          <div className="flex items-center gap-1">
            {doctor.rating_count > 0 ? (
              <>
                <Star className="w-3 h-3" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                <span className="text-xs font-semibold" style={{ color: '#1C1917' }}>{doctor.rating_avg.toFixed(1)}</span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>({doctor.rating_count})</span>
              </>
            ) : (
              <span className="text-xs" style={{ color: '#9CA3AF' }}>No reviews</span>
            )}
          </div>
          {doctor.one_time_rate && (
            <span className="text-xs font-bold" style={{ color: '#1C1917' }}>
              {formatNaira(doctor.one_time_rate)}<span className="font-normal" style={{ color: '#9CA3AF' }}>/session</span>
            </span>
          )}
        </div>

        <Link
          href={`/doctors/${doctor.slug}`}
          className="block text-center text-xs font-semibold py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: '#0C4A2F', color: '#fff' }}
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

// ── FindDoctorView ────────────────────────────────────────────────────────────

function FindDoctorView({
  onBack,
  favourites,
  onToggleFavourite,
  onShare,
}: {
  onBack: () => void
  favourites: string[]
  onToggleFavourite: (id: string) => void
  onShare: (doctor: DoctorWithRelations) => void
}) {
  const [specialty, setSpecialty] = useState('All Specialties')
  const [locationState, setLocationState] = useState('All States')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState(100000)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

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
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      {/* Back button + title */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-gray-100"
          style={{ border: '1.5px solid #E5E7EB' }}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#1C1917' }} />
        </button>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
          >
            Find a Doctor
          </h1>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            <span className="font-semibold" style={{ color: '#16A34A' }}>{onlineDoctors} online now</span>
            {' · '}MDCN-verified doctors
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialty or condition…"
          className="w-full pl-10 pr-4 h-10 rounded-xl text-sm outline-none transition-all"
          style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
        />
      </div>

      {/* Filter toggle button (mobile-friendly) */}
      <button
        type="button"
        onClick={() => setShowFilters((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium mb-3 px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100"
        style={{ color: '#1C1917', border: '1.5px solid #E5E7EB', background: '#fff' }}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: '#0C4A2F' }} />
        Filters
        {(specialty !== 'All Specialties' || locationState !== 'All States' || onlineOnly || maxPrice < 100000) && (
          <span
            className="ml-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ background: '#0C4A2F' }}
          >
            !
          </span>
        )}
      </button>

      {/* Filters panel */}
      {showFilters && (
        <div
          className="mb-4 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ background: '#fff', border: '1.5px solid #E5E7EB' }}
        >
          {/* Specialty */}
          <div className="space-y-1">
            <label className="text-xs font-medium block" style={{ color: '#1C1917' }}>Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full h-8 rounded-lg px-2 text-xs outline-none"
              style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
            >
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1" style={{ color: '#1C1917' }}>
              <MapPin className="w-3 h-3" style={{ color: '#9CA3AF' }} />State
            </label>
            <select
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              className="w-full h-8 rounded-lg px-2 text-xs outline-none"
              style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
            >
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-medium block" style={{ color: '#1C1917' }}>
              Max price: <span style={{ color: '#0C4A2F' }}>₦{maxPrice.toLocaleString()}</span>
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
          </div>

          {/* Online only + Reset */}
          <div className="flex flex-col justify-between">
            <label
              className="flex items-center gap-2 cursor-pointer text-xs font-medium"
              style={{ color: '#1C1917' }}
            >
              <button
                type="button"
                onClick={() => setOnlineOnly((v) => !v)}
                className="relative inline-flex h-5 w-9 rounded-full transition-colors shrink-0"
                style={{ background: onlineOnly ? '#16A34A' : '#E5E7EB' }}
                aria-pressed={onlineOnly}
              >
                <span
                  className="absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: onlineOnly ? 'translateX(1.25rem)' : 'translateX(0.125rem)' }}
                />
              </button>
              <Wifi className="w-3 h-3" style={{ color: onlineOnly ? '#16A34A' : '#9CA3AF' }} />
              Online only
            </label>
            <button
              type="button"
              onClick={() => {
                setSpecialty('All Specialties')
                setLocationState('All States')
                setOnlineOnly(false)
                setMaxPrice(100000)
                setSearch('')
              }}
              className="text-xs font-medium hover:underline mt-2"
              style={{ color: '#9CA3AF', textAlign: 'left' }}
            >
              Reset all
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
        Showing <span className="font-bold" style={{ color: '#1C1917' }}>{filtered.length}</span> doctors
        {onlineOnly && <span style={{ color: '#16A34A', fontWeight: 500 }}> · Online only</span>}
      </p>

      {/* Doctor grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((doctor) => (
            <InlineDoctorCard
              key={doctor.id}
              doctor={doctor}
              isFavourite={favourites.includes(doctor.id)}
              onToggleFavourite={onToggleFavourite}
              onShare={onShare}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>No doctors found</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}

// ── Main content (needs Suspense for useSearchParams) ─────────────────────────

function PatientDashboardContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<'overview' | 'find-doctor'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [stats, setStats] = useState({ consultations: 0, activeSessions: 0, documents: 0 })

  const [favourites, setFavourites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('doc_favourites') ?? '[]') }
    catch { return [] }
  })

  // Sync view from URL on mount
  useEffect(() => {
    if (searchParams.get('tab') === 'find-doctor') setView('find-doctor')
  }, [searchParams])

  // Fetch user data
  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      const [profileRes, totalRes, activeRes, docRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('chat_sessions').select('id', { count: 'exact', head: true }).eq('patient_id', user.id),
        supabase.from('chat_sessions').select('id', { count: 'exact', head: true }).eq('patient_id', user.id).eq('status', 'active'),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('patient_id', user.id),
      ])
      setProfile(profileRes.data)
      setStats({
        consultations: totalRes.count ?? 0,
        activeSessions: activeRes.count ?? 0,
        documents: docRes.count ?? 0,
      })
      setIsLoading(false)
    }
    load()
  }, [])

  const toggleFavourite = (id: string) => {
    const next = favourites.includes(id)
      ? favourites.filter((f) => f !== id)
      : [...favourites, id]
    setFavourites(next)
    localStorage.setItem('doc_favourites', JSON.stringify(next))
  }

  const shareDoctor = async (doctor: DoctorWithRelations) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://docconnect-kappa.vercel.app'}/register`
    const text = `I found an amazing doctor on DocConnect! Dr. ${doctor.profile.full_name} specializes in ${doctor.specialization?.name ?? 'healthcare'}. Join DocConnect for quality medical consultations from home.`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'DocConnect', text, url })
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        toast.success('Link copied to clipboard!')
      }
    } catch { /* user cancelled */ }
  }

  if (view === 'find-doctor') {
    return (
      <FindDoctorView
        onBack={() => setView('overview')}
        favourites={favourites}
        onToggleFavourite={toggleFavourite}
        onShare={shareDoctor}
      />
    )
  }

  const hour = new Date().getHours()
  const firstName = profile?.full_name?.split(' ')[0] ?? null

  const statsRow = [
    { label: 'Total Consultations', value: stats.consultations, icon: Activity, iconColor: '#0C6B4E', iconBg: 'rgba(12,107,78,0.1)' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: MessageCircle, iconColor: '#D4A017', iconBg: 'rgba(212,160,23,0.12)' },
    { label: 'Documents', value: stats.documents, icon: FileText, iconColor: '#C0392B', iconBg: 'rgba(192,57,43,0.1)' },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-5xl mx-auto w-full">
      {/* Welcome header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          {isLoading
            ? 'Loading…'
            : `${getGreeting(hour)}, ${firstName ?? 'there'}`}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
          Here&apos;s an overview of your health consultations.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          : statsRow.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
              <div
                key={label}
                className="rounded-xl bg-white p-4 text-center shadow-sm"
                style={{ border: '1.5px solid #E5E7EB' }}
              >
                <div
                  className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ background: iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <p className="text-xl font-bold" style={{ color: '#1C1917' }}>{value}</p>
                <p className="text-xs mt-0.5 leading-tight" style={{ color: '#9CA3AF' }}>{label}</p>
              </div>
            ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2
          className="font-semibold mb-3"
          style={{ color: '#1C1917', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
        >
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <QuickAction
            icon={Search}
            title="Find a Doctor"
            description="Browse 2,800+ verified doctors"
            onClick={() => setView('find-doctor')}
            highlight
          />
          <QuickAction
            icon={MessageCircle}
            title="My Consultations"
            description="View chat sessions & history"
            href="/patient/chats"
          />
          <QuickAction
            icon={FileText}
            title="My Documents"
            description="Manage medical documents"
            href="/patient/documents"
          />
        </div>
      </div>

      {/* Active subscriptions — empty state for new users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-semibold"
            style={{ color: '#1C1917', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
          >
            Active Subscriptions
          </h2>
          <Link href="/patient/subscriptions" className="text-xs font-medium hover:underline" style={{ color: '#0C6B4E' }}>
            View all
          </Link>
        </div>
        <div className="rounded-xl bg-white p-6 text-center shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>No active subscriptions yet.</p>
          <button
            type="button"
            onClick={() => setView('find-doctor')}
            className="mt-2 inline-block text-sm font-medium hover:underline"
            style={{ color: '#0C6B4E' }}
          >
            Find a doctor to subscribe to
          </button>
        </div>
      </div>

      {/* Recent consultations — empty state for new users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-semibold"
            style={{ color: '#1C1917', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
          >
            Recent Consultations
          </h2>
          <Link href="/patient/chats" className="text-xs font-medium hover:underline" style={{ color: '#0C6B4E' }}>
            View all
          </Link>
        </div>
        <div className="rounded-xl bg-white p-6 text-center shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>No consultations yet.</p>
          <button
            type="button"
            onClick={() => setView('find-doctor')}
            className="mt-2 inline-block text-sm font-medium hover:underline"
            style={{ color: '#0C6B4E' }}
          >
            Book your first consultation
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatientDashboardPage() {
  return (
    <Suspense fallback={<div className="flex-1 animate-pulse" />}>
      <PatientDashboardContent />
    </Suspense>
  )
}
