import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Stethoscope,
  Search,
  LogIn,
  UserPlus,
  Shield,
  Award,
} from 'lucide-react'

export const metadata: Metadata = {
  title: {
    default: 'DocConnect',
    template: '%s | DocConnect',
  },
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function PublicNavbar() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: 'rgba(245,239,228,0.92)', borderColor: '#E5E7EB' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity"
              style={{ background: '#0C4A2F' }}
            >
              <Stethoscope className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span
              className="font-bold text-xl tracking-tight"
              style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#0C4A2F' }}
            >
              DocConnect
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/doctors"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#4B5563' }}
            >
              <Search className="w-3.5 h-3.5" />
              Find a Doctor
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#4B5563' }}
            >
              How it Works
            </Link>
            <Link
              href="/#for-doctors"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#4B5563' }}
            >
              For Doctors
            </Link>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-all hover:bg-black/5"
              style={{ color: '#1C1917' }}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ background: '#0C4A2F' }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function PublicFooter() {
  return (
    <footer style={{ background: '#0A3D2D' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Stethoscope className="text-white" style={{ width: 18, height: 18 }} />
              </div>
              <span
                className="font-bold text-xl text-white tracking-tight"
                style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
              >
                DocConnect
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Nigeria&apos;s verified telemedicine platform. NDPR &amp; MDCN compliant.
              Secured by Paystack.
            </p>
            {/* Trust badges */}
            <div className="flex gap-3 mt-5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10">
                <Shield className="w-3 h-3" style={{ color: '#D4A017' }} />
                <span className="text-xs font-medium text-white">NDPR</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10">
                <Award className="w-3 h-3" style={{ color: '#D4A017' }} />
                <span className="text-xs font-medium text-white">MDCN</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li><Link href="/doctors" className="hover:text-white transition-colors">Find a Doctor</Link></li>
              <li><Link href="/register?role=doctor" className="hover:text-white transition-colors">Join as Doctor</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="/#for-doctors" className="hover:text-white transition-colors">For Doctors</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/ndpr" className="hover:text-white transition-colors">NDPR Compliance</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li>
                <a href="mailto:support@docconnect.ng" className="hover:text-white transition-colors">
                  support@docconnect.ng
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            &copy; 2026 DocConnect Technologies Limited. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            MDCN Registered Platform · NDPR Compliant · ISO 27001 (in progress)
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
