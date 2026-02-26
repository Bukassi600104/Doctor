'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BadgeCheck,
  Users,
  BarChart2,
  Settings,
  Stethoscope,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  CreditCard,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/verification', icon: BadgeCheck, label: 'Verification Queue', badge: 5 },
  { href: '/admin/doctors', icon: Users, label: 'All Doctors' },
  { href: '/admin/patients', icon: Users, label: 'All Patients' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/admin/flags', icon: ShieldAlert, label: 'Flagged Content' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

// ── Nav item ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
  badge?: number
  onClick?: () => void
}

function NavItem({ href, icon: Icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={
        active
          ? { background: '#0C4A2F', color: '#fff', boxShadow: '0 1px 4px rgba(12,74,47,0.3)' }
          : { color: '#6B7280' }
      }
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = '#F3F4F6'
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold shrink-0"
          style={active ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#C0392B', color: '#fff' }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAFA' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#0C4A2F' }}>
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-bold text-lg"
            style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#0C4A2F' }}
          >
            DocConnect
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
            <X className="w-5 h-5" style={{ color: '#9CA3AF' }} />
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div
        className="mx-3 mt-4 mb-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(212,160,23,0.1)', border: '1.5px solid rgba(212,160,23,0.25)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: '#0C4A2F' }}
          >
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs" style={{ color: '#1C1917' }}>Admin Panel</p>
            <p className="text-xs font-medium" style={{ color: '#D4A017' }}>Super Administrator</p>
          </div>
          <Bell className="w-4 h-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }} />
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
          Management
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={
              item.href === '/admin/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href)
            }
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600"
          style={{ color: '#9CA3AF' }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log out
        </button>
      </div>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F5F0' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0 border-r"
        style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden transition-transform duration-300 border-r',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: '#E5E7EB' }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ background: '#fff', borderColor: '#E5E7EB' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" style={{ color: '#1C1917' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0C4A2F' }}>
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold" style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#0C4A2F' }}>
              DocConnect
            </span>
            <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Admin</span>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
            <Bell className="w-5 h-5" style={{ color: '#1C1917' }} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#C0392B' }} />
          </button>
        </header>

        {/* Top bar (desktop) */}
        <header
          className="hidden lg:flex items-center justify-between px-6 py-3 border-b shrink-0"
          style={{ background: '#fff', borderColor: '#E5E7EB' }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#1C1917' }}>Admin Control Panel</h2>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>DocConnect Platform Administration</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
              <Bell className="w-4 h-4" style={{ color: '#9CA3AF' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#C0392B' }} />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
              style={{ background: '#0C4A2F' }}
            >
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex">
          {children}
        </main>
      </div>
    </div>
  )
}
