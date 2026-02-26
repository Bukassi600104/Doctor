'use client'

/**
 * Doctor Dashboard
 *
 * TODO: Replace placeholder data with Supabase queries + realtime
 * subscriptions for online status and unread messages.
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Wallet,
  Clock,
  Users,
  MessageCircle,
  Activity,
  ChevronRight,
  Wifi,
  WifiOff,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNaira, formatRelativeTime } from '@/lib/utils'

// ── Placeholder data ──────────────────────────────────────────────────────────

const MOCK_EARNINGS = {
  thisMonth: 285000,
  total: 1420000,
  pending: 45000,
}

const MOCK_STATS = {
  consultationsToday: 4,
  activePatients: 12,
  avgResponseTime: '8 min',
  rating: 4.9,
}

const MOCK_PATIENT_QUEUE = [
  {
    id: 'p1',
    name: 'Adaeze Nwosu',
    lastMessage: 'Doctor, I have been experiencing chest pains since this morning...',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 3,
    sessionType: 'subscription' as const,
    isNew: true,
  },
  {
    id: 'p2',
    name: 'Babatunde Adeola',
    lastMessage: 'Thank you for the prescription. Should I take it with food?',
    lastMessageAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    unreadCount: 1,
    sessionType: 'one_time' as const,
    isNew: false,
  },
  {
    id: 'p3',
    name: 'Ifeoma Chukwu',
    lastMessage: 'My blood pressure reading today was 145/95. Is that concerning?',
    lastMessageAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    sessionType: 'subscription' as const,
    isNew: false,
  },
  {
    id: 'p4',
    name: 'Kehinde Ogundimu',
    lastMessage: 'Attached the lab results you requested.',
    lastMessageAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    sessionType: 'one_time' as const,
    isNew: false,
  },
]

// ── Earnings card ─────────────────────────────────────────────────────────────

function EarningsCard() {
  return (
    <div
      className="rounded-2xl p-6 text-white relative overflow-hidden"
      style={{ background: '#0C4A2F' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        aria-hidden
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none"
        style={{ background: 'rgba(212,160,23,0.15)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <Wallet className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
          <h3 className="font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Earnings Overview</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>This Month</p>
            <p className="text-xl sm:text-2xl font-bold">{formatNaira(MOCK_EARNINGS.thisMonth)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Earned</p>
            <p className="text-xl sm:text-2xl font-bold">{formatNaira(MOCK_EARNINGS.total)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#D4A017' }}>
              {formatNaira(MOCK_EARNINGS.pending)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+18% vs last month</span>
        </div>
      </div>
    </div>
  )
}

// ── Online toggle ─────────────────────────────────────────────────────────────

function OnlineToggle() {
  const [isOnline, setIsOnline] = useState(true)

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        border: `1.5px solid ${isOnline ? '#C6E0D3' : '#E5E7EB'}`,
        background: isOnline ? '#E8F5EE' : '#fff',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{ background: isOnline ? '#16A34A' : '#E5E7EB' }}
          >
            {isOnline ? (
              <Wifi className="w-5 h-5 text-white" />
            ) : (
              <WifiOff className="w-5 h-5" style={{ color: '#9CA3AF' }} />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>
              {isOnline ? 'You are Online' : 'You are Offline'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              {isOnline
                ? 'Patients can see you and send messages'
                : 'Go online to start receiving consultations'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOnline((prev) => !prev)}
          role="switch"
          aria-checked={isOnline}
          className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none"
          style={{ background: isOnline ? '#16A34A' : '#E5E7EB' }}
        >
          <span
            className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 mt-1"
            style={{ transform: isOnline ? 'translateX(2rem)' : 'translateX(0.25rem)' }}
          />
        </button>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1C1917' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorDashboardPage() {
  const totalUnread = MOCK_PATIENT_QUEUE.reduce((sum, p) => sum + p.unreadCount, 0)

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          Doctor Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
          Welcome back, Dr. Emeka. Here&apos;s your overview for today.
        </p>
      </div>

      {/* Earnings card */}
      <EarningsCard />

      {/* Online toggle */}
      <OnlineToggle />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Activity}
          label="Consultations Today"
          value={MOCK_STATS.consultationsToday}
          iconColor="#0C6B4E"
          iconBg="rgba(12,107,78,0.1)"
        />
        <StatCard
          icon={Users}
          label="Active Patients"
          value={MOCK_STATS.activePatients}
          iconColor="#D4A017"
          iconBg="rgba(212,160,23,0.12)"
        />
        <StatCard
          icon={Clock}
          label="Avg. Response"
          value={MOCK_STATS.avgResponseTime}
          iconColor="#C0392B"
          iconBg="rgba(192,57,43,0.1)"
        />
        <StatCard
          icon={Star}
          label="Rating"
          value={`${MOCK_STATS.rating}★`}
          iconColor="#CA8A04"
          iconBg="#FEF9C3"
        />
      </div>

      {/* Patient queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2
              className="font-semibold"
              style={{ color: '#1C1917', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
            >
              Patient Queue
            </h2>
            {totalUnread > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                style={{ background: '#C0392B' }}
              >
                {totalUnread}
              </span>
            )}
          </div>
          <Link href="/doctor/patients" className="text-xs font-medium hover:underline" style={{ color: '#0C6B4E' }}>
            View all
          </Link>
        </div>

        <div className="rounded-xl bg-white overflow-hidden shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
          {MOCK_PATIENT_QUEUE.map((patient, idx) => (
            <Link
              key={patient.id}
              href={`/doctor/chats/${patient.id}`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 group"
              style={{ borderTop: idx > 0 ? '1px solid #F3F4F6' : undefined }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: '#0C4A2F' }}
                >
                  {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                {patient.isNew && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: '#C0392B' }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate" style={{ color: '#1C1917' }}>
                    {patient.name}
                  </p>
                  <span
                    className="inline-flex text-xs px-1.5 py-0.5 rounded-full shrink-0 font-medium"
                    style={
                      patient.sessionType === 'subscription'
                        ? { background: 'rgba(12,74,47,0.1)', color: '#0C4A2F' }
                        : { background: '#F3F4F6', color: '#9CA3AF' }
                    }
                  >
                    {patient.sessionType === 'subscription' ? 'Sub' : '1x'}
                  </span>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>
                  {patient.lastMessage}
                </p>
              </div>

              {/* Right */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  {formatRelativeTime(patient.lastMessageAt)}
                </p>
                {patient.unreadCount > 0 ? (
                  <span
                    className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ background: '#C0392B' }}
                  >
                    {patient.unreadCount}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: '#D1D5DB' }} />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/doctor/earnings"
          className="flex items-center gap-3 p-4 rounded-xl bg-white transition-all group hover:shadow-sm"
          style={{ border: '1.5px solid #E5E7EB' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C6E0D3' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
            style={{ background: 'rgba(12,74,47,0.1)' }}
          >
            <Wallet className="w-5 h-5" style={{ color: '#0C4A2F' }} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: '#1C1917' }}>View Earnings</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Payouts, history &amp; settings</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: '#D1D5DB' }} />
        </Link>

        <Link
          href="/doctor/schedule"
          className="flex items-center gap-3 p-4 rounded-xl bg-white transition-all group hover:shadow-sm"
          style={{ border: '1.5px solid #E5E7EB' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#F5E6B3' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
            style={{ background: 'rgba(212,160,23,0.12)' }}
          >
            <MessageCircle className="w-5 h-5" style={{ color: '#D4A017' }} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: '#1C1917' }}>Manage Schedule</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Set availability &amp; rates</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: '#D1D5DB' }} />
        </Link>
      </div>
    </div>
  )
}
