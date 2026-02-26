import type { Metadata } from 'next'
import Link from 'next/link'
import { Stethoscope, Shield, Clock, Users, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Auth',
}

const TRUST_POINTS = [
  {
    icon: Shield,
    title: 'MDCN Verified Doctors',
    desc: 'Every doctor verified against the Medical and Dental Council of Nigeria registry.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    desc: 'Access healthcare day or night. See which doctors are online right now.',
  },
  {
    icon: Users,
    title: '50,000+ Consultations',
    desc: 'Trusted by patients and doctors across all 36 states of Nigeria.',
  },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — deep forest green (hidden on mobile) ── */}
      <div
        className="hidden md:flex md:w-[48%] lg:w-[44%] flex-col relative overflow-hidden"
        style={{ background: '#0C4A2F' }}
      >
        {/* Subtle dot pattern overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Glow blobs */}
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(212,160,23,0.12)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span
              className="font-bold text-2xl text-white tracking-tight"
              style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
            >
              DocConnect
            </span>
          </Link>

          {/* Hero copy */}
          <div className="mt-16">
            <h2
              className="text-3xl lg:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
            >
              Quality healthcare,
              <br />
              wherever you are.
            </h2>
            <p className="mt-4 leading-relaxed max-w-sm text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Nigeria&apos;s first verified telemedicine platform connecting
              patients with MDCN-certified doctors across all 36 states.
            </p>
          </div>

          {/* Trust points */}
          <div className="mt-12 space-y-6">
            {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Gold accent bar */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#D4A017' }}>
              Trusted &amp; Secure
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Footer */}
          <div className="mt-auto pt-10">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              &copy; 2026 DocConnect · NDPR &amp; MDCN compliant · Secured by Paystack
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col" style={{ background: '#FAFAFA' }}>
        {/* Top bar with back link */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#6B7280' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#0C4A2F' }}
            >
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-bold text-base"
              style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#0C4A2F' }}
            >
              DocConnect
            </span>
          </Link>
          <div className="w-24" /> {/* spacer to center logo on mobile */}
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-start md:items-center justify-center px-4 py-10 md:py-16">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
