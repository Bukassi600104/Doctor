'use client'

/**
 * Patient Dashboard
 *
 * TODO: Replace skeleton placeholders with real Supabase data fetching once
 * the auth + DB layer is fully wired. This is a client component so it can
 * use React Query / Supabase realtime subscriptions when ready.
 */

import Link from 'next/link'
import {
  Search,
  MessageCircle,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
} from 'lucide-react'
import { formatNaira, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ── Placeholder data ──────────────────────────────────────────────────────────

const MOCK_USER_NAME = 'Amara'
const MOCK_HOUR = new Date().getHours()

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const MOCK_SUBSCRIPTIONS = [
  {
    id: 's1',
    doctorName: 'Dr. Emeka Obi',
    specialty: 'Cardiology',
    amount: 40000,
    status: 'active' as const,
    endDate: '2026-03-22',
    slug: 'dr-emeka-obi',
  },
  {
    id: 's2',
    doctorName: 'Dr. Aisha Bello',
    specialty: 'Dermatology',
    amount: 50000,
    status: 'active' as const,
    endDate: '2026-02-28',
    slug: 'dr-aisha-bello',
  },
]

const MOCK_RECENT_SESSIONS = [
  {
    id: 'sess1',
    doctorName: 'Dr. Emeka Obi',
    specialty: 'Cardiology',
    lastMessage: 'Thank you for sending those test results. Based on what I can see...',
    lastMessageAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    unreadCount: 2,
    status: 'active' as const,
  },
  {
    id: 'sess2',
    doctorName: 'Dr. Fatima Sule',
    specialty: 'General Practice',
    lastMessage: 'Please take the medication as prescribed and come back if symptoms persist.',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    status: 'completed' as const,
  },
  {
    id: 'sess3',
    doctorName: 'Dr. Ngozi Okafor',
    specialty: 'Gynaecology',
    lastMessage: 'I have reviewed your ultrasound. Everything looks normal for this stage.',
    lastMessageAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    status: 'completed' as const,
  },
]

const MOCK_STATS = [
  { label: 'Total Consultations', value: '12', icon: Activity, iconColor: '#0C6B4E', iconBg: 'rgba(12,107,78,0.1)' },
  { label: 'Active Sessions', value: '1', icon: MessageCircle, iconColor: '#D4A017', iconBg: 'rgba(212,160,23,0.12)' },
  { label: 'Documents', value: '8', icon: FileText, iconColor: '#C0392B', iconBg: 'rgba(192,57,43,0.1)' },
]

// ── Quick action card ─────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ElementType
  title: string
  description: string
  href: string
  highlight?: boolean
}

function QuickAction({ icon: Icon, title, description, href, highlight }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
      style={{
        border: `1.5px solid ${highlight ? 'rgba(12,74,47,0.2)' : '#E5E7EB'}`,
        background: highlight ? 'rgba(12,74,47,0.04)' : '#fff',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ background: highlight ? '#0C4A2F' : '#F3F4F6' }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: highlight ? '#fff' : '#9CA3AF' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm"
          style={{ color: highlight ? '#0C4A2F' : '#1C1917' }}
        >
          {title}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0" style={{ color: '#D1D5DB' }} />
    </Link>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md', className)} style={{ background: '#E5E7EB' }} />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatientDashboardPage() {
  const isLoading = false

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-5xl mx-auto w-full">
      {/* Welcome header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          {getGreeting(MOCK_HOUR)}, {MOCK_USER_NAME}
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
          : MOCK_STATS.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
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
            href="/doctors"
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

      {/* Active subscriptions */}
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

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : MOCK_SUBSCRIPTIONS.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No active subscriptions.</p>
            <Link href="/doctors" className="mt-2 inline-block text-sm font-medium hover:underline" style={{ color: '#0C6B4E' }}>
              Find a doctor to subscribe to
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_SUBSCRIPTIONS.map((sub) => {
              const daysLeft = Math.max(
                0,
                Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 3600 * 24))
              )
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                  style={{ border: '1.5px solid #E5E7EB' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: '#0C4A2F' }}
                  >
                    {sub.doctorName.split(' ').slice(1, 3).map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: '#1C1917' }}>{sub.doctorName}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{sub.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                      {formatNaira(sub.amount)}<span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>/mo</span>
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: daysLeft <= 5 ? '#C0392B' : '#9CA3AF' }}
                    >
                      {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                    </p>
                  </div>
                  <Link
                    href="/patient/chats"
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                    style={{ background: '#F3F4F6' }}
                  >
                    <MessageCircle className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent chat sessions */}
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

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : MOCK_RECENT_SESSIONS.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No consultations yet.</p>
            <Link href="/doctors" className="mt-2 inline-block text-sm font-medium hover:underline" style={{ color: '#0C6B4E' }}>
              Book your first consultation
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-white overflow-hidden shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
            {MOCK_RECENT_SESSIONS.map((session, idx) => (
              <Link
                key={session.id}
                href={`/patient/chats/${session.id}`}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 group"
                style={{ borderTop: idx > 0 ? '1px solid #F3F4F6' : undefined }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: '#0C4A2F' }}
                >
                  {session.doctorName.split(' ').slice(1, 3).map((n) => n[0]).join('')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate" style={{ color: '#1C1917' }}>
                      {session.doctorName}
                    </p>
                    {session.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs shrink-0" style={{ color: '#9CA3AF' }}>
                        <Clock className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>
                    {session.lastMessage}
                  </p>
                </div>

                {/* Right */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    {formatRelativeTime(session.lastMessageAt)}
                  </p>
                  {session.unreadCount > 0 && (
                    <span
                      className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                      style={{ background: '#C0392B' }}
                    >
                      {session.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Health tip banner */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ border: '1.5px solid rgba(212,160,23,0.3)', background: 'rgba(212,160,23,0.05)' }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D4A017' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
          <span className="font-semibold" style={{ color: '#1C1917' }}>Health tip:</span> Your last consultation was 7 days ago.
          Consider booking a follow-up with Dr. Fatima Sule to check on your progress.
        </p>
      </div>
    </div>
  )
}
