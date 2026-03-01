'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatNaira } from '@/lib/utils'

interface EarningEntry {
  id: string
  amount: number
  doctor_cut: number
  status: string
  created_at: string
  session_type?: string
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg }: {
  label: string; value: string; icon: React.ElementType; iconColor: string; iconBg: string
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1C1917' }}>{value}</p>
    </div>
  )
}

export default function DoctorEarningsPage() {
  const [earnings, setEarnings] = useState<EarningEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState({ total: 0, thisMonth: 0, pending: 0, paid: 0 })

  useEffect(() => {
    loadEarnings()
  }, [])

  async function loadEarnings() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!doctorProfile) { setIsLoading(false); return }

    // Get all sessions for this doctor, then check payments
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id, session_type')
      .eq('doctor_id', doctorProfile.id)

    if (!sessions?.length) { setIsLoading(false); return }

    const sessionIds = sessions.map((s: { id: string }) => s.id)
    const sessionTypeMap = new Map(sessions.map((s: { id: string; session_type: string }) => [s.id, s.session_type]))

    const { data: payments } = await supabase
      .from('payments')
      .select('id, amount, doctor_cut, status, created_at, session_id')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })

    const items: EarningEntry[] = (payments ?? []).map((p: { id: string; amount: number; doctor_cut: number; status: string; created_at: string; session_id: string }) => ({
      id: p.id,
      amount: p.amount,
      doctor_cut: p.doctor_cut,
      status: p.status,
      created_at: p.created_at,
      session_type: sessionTypeMap.get(p.session_id),
    }))

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const total = items.filter((e) => e.status === 'success').reduce((sum, e) => sum + e.doctor_cut, 0)
    const thisMonth = items.filter((e) => e.status === 'success' && e.created_at >= thisMonthStart).reduce((sum, e) => sum + e.doctor_cut, 0)
    const pending = items.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.doctor_cut, 0)

    setSummary({ total, thisMonth, pending, paid: items.filter((e) => e.status === 'success').length })
    setEarnings(items)
    setIsLoading(false)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          Earnings
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Your consultation revenue overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Earned" value={formatNaira(summary.total)} icon={Wallet} iconColor="#0C6B4E" iconBg="rgba(12,107,78,0.1)" />
        <StatCard label="This Month" value={formatNaira(summary.thisMonth)} icon={TrendingUp} iconColor="#D4A017" iconBg="rgba(212,160,23,0.12)" />
        <StatCard label="Pending" value={formatNaira(summary.pending)} icon={Clock} iconColor="#9CA3AF" iconBg="#F3F4F6" />
        <StatCard label="Paid Sessions" value={String(summary.paid)} icon={CheckCircle} iconColor="#16A34A" iconBg="rgba(22,163,74,0.1)" />
      </div>

      {/* Note */}
      <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: 'rgba(12,74,47,0.04)', border: '1.5px solid rgba(12,74,47,0.12)', color: '#0C4A2F' }}>
        DocConnect retains a 30% platform fee. Your earnings reflect the 70% doctor cut paid out after each completed session.
      </div>

      {/* Transaction list */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: '#1C1917', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}>
          Transaction History
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />)}
          </div>
        ) : earnings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center" style={{ border: '1.5px solid #E5E7EB' }}>
            <Wallet className="w-10 h-10 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p className="font-semibold" style={{ color: '#1C1917' }}>No transactions yet</p>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              Your earnings will appear here once patients book consultations.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div key={e.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm" style={{ border: '1.5px solid #E5E7EB' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: e.status === 'success' ? 'rgba(22,163,74,0.1)' : '#F3F4F6' }}>
                  {e.status === 'success'
                    ? <CheckCircle className="w-4 h-4" style={{ color: '#16A34A' }} />
                    : <Clock className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                    {e.session_type === 'subscription' ? 'Subscription payment' : 'One-time session'}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(e.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: '#1C1917' }}>{formatNaira(e.doctor_cut)}</p>
                  <p className="text-xs" style={{ color: e.status === 'success' ? '#16A34A' : '#9CA3AF' }}>
                    {e.status === 'success' ? 'Paid' : e.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
