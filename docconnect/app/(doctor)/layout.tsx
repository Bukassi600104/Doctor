'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Calendar,
  Settings,
  Stethoscope,
  Bell,
  LogOut,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/doctor/patients', icon: Users, label: 'Patients' },
  { href: '/doctor/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/doctor/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/doctor/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/doctor/settings', icon: Settings, label: 'Settings' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface DoctorUserProfile {
  full_name: string
  avatar_url: string | null
  is_online: boolean
}

// ── Nav item component ────────────────────────────────────────────────────────

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
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative"
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
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0"
          style={active ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#C0392B', color: '#fff' }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void
  userProfile: DoctorUserProfile | null
  onLogout: () => void
}

function Sidebar({ onClose, userProfile, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const initials = userProfile
    ? userProfile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'
  const displayName = userProfile ? `Dr. ${userProfile.full_name.split(' ')[0]}` : 'Loading...'
  const isOnline = userProfile?.is_online ?? false

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAFA' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: '#0C4A2F' }}
          >
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
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" style={{ color: '#9CA3AF' }} />
          </button>
        )}
      </div>

      {/* Doctor profile pill */}
      <div
        className="mx-3 mt-4 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-3"
        style={{ background: '#E8F5EE' }}
      >
        {userProfile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userProfile.avatar_url}
            alt={userProfile.full_name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: '#0C4A2F' }}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs truncate" style={{ color: '#1C1917' }}>{displayName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: isOnline ? '#16A34A' : '#9CA3AF' }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: isOnline ? '#16A34A' : '#9CA3AF' }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <Bell className="w-4 h-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={
              item.href === '/doctor/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href)
            }
            badge={item.href === '/doctor/chats' ? 4 : undefined}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={onLogout}
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

// ── Bottom tab bar (mobile) ───────────────────────────────────────────────────

function BottomTabBar() {
  const pathname = usePathname()
  const items = NAV_ITEMS.slice(0, 5)

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t lg:hidden"
      style={{ background: '#fff', borderColor: '#E5E7EB' }}
    >
      <div className="flex">
        {items.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/doctor/dashboard'
              ? pathname === href
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
              style={{ color: active ? '#0C6B4E' : '#9CA3AF' }}
            >
              <Icon className="w-5 h-5" style={{ color: active ? '#0C6B4E' : '#9CA3AF' }} />
              <span className="truncate leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<DoctorUserProfile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [profileRes, doctorRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
        supabase.from('doctor_profiles').select('is_online').eq('user_id', user.id).single(),
      ])
      if (profileRes.data) {
        setUserProfile({
          full_name: profileRes.data.full_name,
          avatar_url: profileRes.data.avatar_url,
          is_online: doctorRes.data?.is_online ?? false,
        })
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F5F0' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 shrink-0 border-r"
        style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
      >
        <Sidebar userProfile={userProfile} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden transition-transform duration-300 border-r',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: '#E5E7EB' }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} userProfile={userProfile} onLogout={handleLogout} />
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
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#0C4A2F' }}
            >
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-bold"
              style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#0C4A2F' }}
            >
              DocConnect
            </span>
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" style={{ color: '#1C1917' }} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#C0392B' }} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 flex">
          {children}
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}
