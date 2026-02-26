/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { Star, MapPin, MessageCircle, Award } from 'lucide-react'
import { OnlineIndicator } from './OnlineIndicator'
import type { DoctorProfile } from '@/types'
import { formatNaira } from '@/lib/utils'

const G = {
  green:      "#0C4A2F",
  greenLight: "#E8F5EE",
  gold:       "#C9A14A",
  charcoal:   "#1C1917",
  muted:      "#6B7280",
  border:     "#E5E7EB",
} as const

const SERIF = '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif'

interface DoctorCardProps {
  doctor: DoctorProfile & {
    profile: { full_name: string; avatar_url: string | null }
    specialization?: { name: string }
  }
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const name = doctor.profile.full_name
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      style={{
        display: 'block',
        background: '#fff',
        borderRadius: '1.25rem',
        border: `1px solid ${G.border}`,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      className="hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Photo / Avatar strip */}
      <div style={{ height: 180, background: G.greenLight, position: 'relative', overflow: 'hidden' }}>
        {doctor.profile.avatar_url ? (
          <img
            src={doctor.profile.avatar_url}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          />
        ) : (
          /* Initials fallback */
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: G.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: SERIF, fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
            </div>
          </div>
        )}

        {/* Online status pill */}
        <div style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: doctor.is_online ? '#16A34A' : '#9CA3AF',
          borderRadius: '9999px', padding: '0.2rem 0.625rem',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>
            {doctor.is_online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Verified badge */}
        {doctor.verification_status === 'verified' && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            background: '#fff', borderRadius: '0.5rem', padding: '0.2rem 0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <Award size={11} style={{ color: G.gold }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: G.charcoal }}>MDCN Verified</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1.125rem' }}>
        <h3 style={{ fontWeight: 700, color: G.charcoal, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
          Dr. {name}
        </h3>

        {doctor.specialization && (
          <p style={{ fontSize: '0.8rem', color: G.green, fontWeight: 600, marginBottom: '0.4rem' }}>
            {doctor.specialization.name}
          </p>
        )}

        {doctor.location_state && (
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={10} />{doctor.location_city ?? doctor.location_state}
          </p>
        )}

        {/* Rating + Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {doctor.rating_count > 0 ? (
              <>
                <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: G.charcoal }}>{doctor.rating_avg.toFixed(1)}</span>
                <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>({doctor.rating_count})</span>
              </>
            ) : (
              <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>No reviews yet</span>
            )}
          </div>
          {doctor.one_time_rate && (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: G.charcoal }}>
              {formatNaira(doctor.one_time_rate)}
              <span style={{ fontSize: '0.68rem', fontWeight: 400, color: '#9CA3AF' }}>/session</span>
            </span>
          )}
        </div>

        {/* CTA */}
        <div style={{
          background: G.green, color: '#fff', textAlign: 'center',
          padding: '0.625rem', borderRadius: '0.5rem',
          fontSize: '0.8rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
        }}>
          <MessageCircle size={13} /> Chat Now
        </div>
      </div>
    </Link>
  )
}
