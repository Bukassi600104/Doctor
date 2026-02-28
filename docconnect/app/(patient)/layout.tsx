'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Search,
  MessageCircle,
  FileText,
  Settings,
  Stethoscope,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// ── Nav item definitions ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/patient/dashboard?tab=find-doctor', icon: Search, label: 'Find Doctor' },
  { href: '/patient/chats', icon: MessageCircle, label: 'My Chats' },
  { href: '/patient/documents', icon: FileText, label: 'Documents' },
  { href: '/patient/settings', icon: Settings, label: 'Settings' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  full_name: string
  avatar_url: string | null
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
  onClick?: () => void
}

function NavItem({ href, icon: Icon, label, active, onClick }: NavItemProps) {
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
      {label}
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void
  userProfile: UserProfile | null
  onLogout: () => void
}

function Sidebar({ onClose, userProfile, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const initials = userProfile
    ? userProfile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'
  const displayName = userProfile?.full_name ?? 'Loading...'

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

      {/* User pill */}
      <div
        className="mx-3 mt-4 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-3"
        style={{ background: '#E8F5EE' }}
      >
        {userProfile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userProfile.avatar_url}
            alt={userProfile.full_name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: '#0C4A2F' }}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs truncate" style={{ color: '#1C1917' }}>{displayName}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Patient</p>
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
              item.href === '/patient/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href.split('?')[0]) && item.href.split('?')[0] !== '/patient/dashboard'
            }
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
      className="fixed bottom-0 inset-x-0 z-50 border-t lg:hidden safe-area-inset-bottom"
      style={{ background: '#fff', borderColor: '#E5E7EB' }}
    >
      <div className="flex">
        {items.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/patient/dashboard'
              ? pathname === href
              : pathname.startsWith(href.split('?')[0]) && href.split('?')[0] !== '/patient/dashboard'
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

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
      if (data) setUserProfile(data)
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

      {/* Mobile drawer overlay */}
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

      {/* Main content */}
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
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" style={{ color: '#1C1917' }} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 flex">
          {children}
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <BottomTabBar />
    </div>
  )
}
