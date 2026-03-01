'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, MessageCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PatientItem {
  id: string
  full_name: string
  avatar_url: string | null
  email: string
  lastSession: string
  sessionCount: number
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    // Get this doctor's profile id
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!doctorProfile) { setIsLoading(false); return }

    // Get all sessions for this doctor
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('patient_id, created_at, updated_at')
      .eq('doctor_id', doctorProfile.id)
      .order('updated_at', { ascending: false })

    if (!sessions?.length) { setIsLoading(false); return }

    // Unique patient IDs with session counts and last session date
    const patientMap = new Map<string, { count: number; lastSession: string }>()
    for (const s of sessions) {
      const existing = patientMap.get(s.patient_id)
      if (!existing) {
        patientMap.set(s.patient_id, { count: 1, lastSession: s.updated_at })
      } else {
        existing.count++
        if (s.updated_at > existing.lastSession) existing.lastSession = s.updated_at
      }
    }

    const patientIds = [...patientMap.keys()]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', patientIds)

    const items: PatientItem[] = (profiles ?? []).map((p: { id: string; full_name: string; avatar_url: string | null; email: string }) => {
      const meta = patientMap.get(p.id)!
      return {
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        email: p.email,
        lastSession: meta.lastSession,
        sessionCount: meta.count,
      }
    })

    // Sort by last session
    items.sort((a, b) => b.lastSession.localeCompare(a.lastSession))
    setPatients(items)
    setIsLoading(false)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          My Patients
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Patients who have consulted with you
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center" style={{ border: '1.5px solid #E5E7EB' }}>
          <Users className="w-10 h-10 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="font-semibold" style={{ color: '#1C1917' }}>No patients yet</p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Your patients will appear here once you have consultations.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient) => {
            const initials = patient.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div
                key={patient.id}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
                style={{ border: '1.5px solid #E5E7EB' }}
              >
                {patient.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={patient.avatar_url} alt={patient.full_name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: '#0C4A2F' }}>
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>{patient.full_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                      <MessageCircle className="w-3 h-3" />
                      {patient.sessionCount} session{patient.sessionCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                      <Clock className="w-3 h-3" />
                      {new Date(patient.lastSession).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/doctor/chats`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90"
                  style={{ background: '#E8F5EE', color: '#0C4A2F' }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
