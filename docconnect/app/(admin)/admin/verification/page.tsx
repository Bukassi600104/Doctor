/**
 * Admin — Doctor Verification Queue
 * Server component: fetches pending applications from Supabase on each request.
 * Approve/Reject actions are handled by the VerifyActions client component.
 */

import type { Metadata } from 'next'
import {
  Clock,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import VerifyActions from './VerifyActions'

export const metadata: Metadata = {
  title: 'Verification Queue — Admin',
  description: 'Review pending doctor credential verification applications.',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ApplicationStatus = 'pending_verification' | 'verified' | 'rejected'

interface PendingApplication {
  id: string
  doctorName: string
  email: string
  mdcnNumber: string
  specialty: string
  location: string
  submittedAt: string
  credentialCount: number
  status: ApplicationStatus
  yearsExperience: number
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const map = {
    pending_verification: {
      label: 'Pending Review',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    verified: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 border-green-200',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  }
  const { label, icon: Icon, className } = map[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// ── Urgency indicator ─────────────────────────────────────────────────────────

function getDaysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 3600 * 24))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VerificationQueuePage() {
  const supabase = await createClient()

  // Fetch all applications (pending + recently reviewed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let applications: PendingApplication[] = []

  const { data: raw } = await supabase
    .from('doctor_profiles')
    .select(`
      id,
      mdcn_number,
      verification_status,
      location_state,
      years_experience,
      created_at,
      profile:profiles!user_id(full_name, email),
      specialization:specializations(name),
      credentials(id)
    `)
    .in('verification_status', ['pending_verification', 'verified', 'rejected'])
    .order('created_at', { ascending: true })

  if (raw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applications = raw.map((r: any) => ({
      id: r.id,
      doctorName: r.profile?.full_name ?? 'Unknown Doctor',
      email: r.profile?.email ?? '',
      mdcnNumber: r.mdcn_number ?? 'Pending',
      specialty: r.specialization?.name ?? 'Not specified',
      location: r.location_state ?? 'Not specified',
      submittedAt: r.created_at,
      credentialCount: Array.isArray(r.credentials) ? r.credentials.length : 0,
      status: r.verification_status as ApplicationStatus,
      yearsExperience: r.years_experience ?? 0,
    }))
  }

  const STATS = {
    pending: applications.filter((a) => a.status === 'pending_verification').length,
    approvedThisWeek: applications.filter((a) => a.status === 'verified').length,
    rejectedThisWeek: applications.filter((a) => a.status === 'rejected').length,
    avgReviewTime: '18h',
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          Doctor Verification Queue
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
          Review and approve/reject pending doctor credential applications.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Pending Review', value: STATS.pending, icon: Clock, iconColor: '#CA8A04', iconBg: '#FEF9C3' },
          { label: 'Approved', value: STATS.approvedThisWeek, icon: CheckCircle, iconColor: '#16A34A', iconBg: '#DCFCE7' },
          { label: 'Rejected', value: STATS.rejectedThisWeek, icon: XCircle, iconColor: '#C0392B', iconBg: '#FEE2E2' },
          { label: 'Avg. Review Time', value: STATS.avgReviewTime, icon: FileCheck, iconColor: '#0C6B4E', iconBg: 'rgba(12,107,78,0.1)' },
        ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="rounded-xl bg-white p-4 shadow-sm"
            style={{ border: '1.5px solid #E5E7EB' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
              style={{ background: iconBg }}
            >
              <Icon className="w-4 h-4" style={{ color: iconColor }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1C1917' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Search by name, MDCN number or specialty…"
            className="w-full h-9 pl-4 pr-4 rounded-lg text-sm outline-none transition-all"
            style={{
              border: '1.5px solid #E5E7EB',
              background: '#fff',
              color: '#1C1917',
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg px-3 text-sm outline-none"
            style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280' }}
          >
            <option>All Statuses</option>
            <option>Pending Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button
            className="h-9 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-colors hover:bg-gray-50"
            style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280' }}
          >
            Date <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white overflow-hidden shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
        {/* Desktop table header */}
        <div
          className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{ background: '#F8F5F0', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF' }}
        >
          <span>Doctor</span>
          <span>MDCN No.</span>
          <span>Specialty</span>
          <span>Submitted</span>
          <span>Credentials</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        <div>
          {applications.map((app, idx) => {
            const daysAgo = getDaysAgo(app.submittedAt)
            const isUrgent = daysAgo >= 3 && app.status === 'pending_verification'

            return (
              <div
                key={app.id}
                className={cn(
                  'px-5 py-4 transition-colors hover:bg-gray-50',
                  'sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] sm:gap-4 sm:items-center',
                  'flex flex-col gap-3'
                )}
                style={{ borderTop: idx > 0 ? '1px solid #F3F4F6' : undefined }}
              >
                {/* Doctor info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: '#0C4A2F' }}
                  >
                    {app.doctorName.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#1C1917' }}>{app.doctorName}</p>
                    <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{app.email}</p>
                  </div>
                </div>

                {/* MDCN */}
                <div className="sm:block">
                  <span className="sm:hidden text-xs mr-1" style={{ color: '#9CA3AF' }}>MDCN:</span>
                  <p className="text-sm font-mono" style={{ color: '#1C1917' }}>{app.mdcnNumber}</p>
                </div>

                {/* Specialty */}
                <div className="sm:block">
                  <span className="sm:hidden text-xs mr-1" style={{ color: '#9CA3AF' }}>Specialty:</span>
                  <p className="text-sm" style={{ color: '#1C1917' }}>{app.specialty}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{app.location}</p>
                </div>

                {/* Submitted */}
                <div className="sm:block">
                  <span className="sm:hidden text-xs mr-1" style={{ color: '#9CA3AF' }}>Submitted:</span>
                  <p className="text-sm" style={{ color: '#1C1917' }}>{formatDate(app.submittedAt)}</p>
                  {isUrgent && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#C0392B' }}>
                      <AlertTriangle className="w-3 h-3" />
                      {daysAgo}d waiting
                    </p>
                  )}
                </div>

                {/* Credentials */}
                <div className="sm:block">
                  <span className="sm:hidden text-xs mr-1" style={{ color: '#9CA3AF' }}>Files:</span>
                  <span className="inline-flex items-center gap-1 text-sm" style={{ color: '#1C1917' }}>
                    <FileCheck className="w-3.5 h-3.5" style={{ color: '#0C6B4E' }} />
                    {app.credentialCount} files
                  </span>
                </div>

                {/* Status */}
                <div className="sm:block">
                  <StatusBadge status={app.status} />
                </div>

                {/* Actions */}
                <div className="sm:text-right">
                  {app.status === 'pending_verification' ? (
                    <VerifyActions doctorId={app.id} />
                  ) : (
                    <span
                      className="text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ color: '#9CA3AF', border: '1px solid #E5E7EB' }}
                    >
                      Reviewed
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {applications.length === 0 && (
          <div className="py-16 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="font-medium" style={{ color: '#1C1917' }}>Queue is empty</p>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              No doctor applications found.
            </p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          Showing <span className="font-medium" style={{ color: '#1C1917' }}>{applications.length}</span> of{' '}
          <span className="font-medium" style={{ color: '#1C1917' }}>{applications.length}</span> applications
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="h-8 px-3 rounded-lg text-sm disabled:opacity-40"
            style={{ border: '1.5px solid #E5E7EB', color: '#9CA3AF' }}
          >
            Previous
          </button>
          <button
            disabled
            className="h-8 px-3 rounded-lg text-sm disabled:opacity-40"
            style={{ border: '1.5px solid #E5E7EB', color: '#9CA3AF' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
