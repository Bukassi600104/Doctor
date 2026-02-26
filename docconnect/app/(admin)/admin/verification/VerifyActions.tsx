'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyActions({ doctorId }: { doctorId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_profile_id: doctorId, action }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        alert(`Action failed: ${error ?? 'Unknown error'}`)
      }
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-1.5 sm:justify-end">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        title="Approve doctor"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ background: '#16A34A' }}
      >
        {loading === 'approve'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <CheckCircle className="w-3.5 h-3.5" />}
        Approve
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        title="Reject doctor"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ background: '#C0392B' }}
      >
        {loading === 'reject'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <XCircle className="w-3.5 h-3.5" />}
        Reject
      </button>
    </div>
  )
}
