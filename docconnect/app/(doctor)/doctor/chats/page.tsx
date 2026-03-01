'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Trash2, Clock, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ChatItem {
  id: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  session_type: 'one_time' | 'subscription'
  created_at: string
  updated_at: string
  patientName: string
  patientAvatarUrl: string | null
  lastMessage: string | null
}

export default function DoctorChatsPage() {
  const [chats, setChats] = useState<ChatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadChats()
  }, [])

  async function loadChats() {
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

    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id, status, session_type, created_at, updated_at, patient_id')
      .eq('doctor_id', doctorProfile.id)
      .order('updated_at', { ascending: false })

    if (!sessions?.length) { setIsLoading(false); return }

    const patientIds = [...new Set(sessions.map((s: { patient_id: string }) => s.patient_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', patientIds)

    const sessionIds = sessions.map((s: { id: string }) => s.id)
    const { data: latestMsgs } = await supabase
      .from('messages')
      .select('session_id, content, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })

    const profileMap = new Map((profiles ?? []).map((p: { id: string; full_name: string; avatar_url: string | null }) => [p.id, p]))
    const lastMsgMap = new Map<string, string>()
    for (const msg of (latestMsgs ?? [])) {
      if (!lastMsgMap.has(msg.session_id)) lastMsgMap.set(msg.session_id, msg.content)
    }

    const items: ChatItem[] = sessions.map((s: { id: string; status: ChatItem['status']; session_type: ChatItem['session_type']; created_at: string; updated_at: string; patient_id: string }) => {
      const profile = profileMap.get(s.patient_id) as { full_name: string; avatar_url: string | null } | undefined
      return {
        id: s.id,
        status: s.status,
        session_type: s.session_type,
        created_at: s.created_at,
        updated_at: s.updated_at,
        patientName: profile?.full_name ?? 'Unknown Patient',
        patientAvatarUrl: profile?.avatar_url ?? null,
        lastMessage: lastMsgMap.get(s.id) ?? null,
      }
    })

    setChats(items)
    setIsLoading(false)
  }

  function handleDelete(id: string) {
    setDeleting(id)
    setTimeout(() => {
      setChats((prev) => prev.filter((c) => c.id !== id))
      setDeleting(null)
      toast.success('Chat removed from your list')
    }, 350)
  }

  function statusBadge(status: ChatItem['status']) {
    const map = {
      active: { label: 'Active', bg: 'rgba(22,163,74,0.1)', color: '#16A34A' },
      pending: { label: 'Pending', bg: 'rgba(212,160,23,0.12)', color: '#D4A017' },
      completed: { label: 'Completed', bg: 'rgba(12,74,47,0.1)', color: '#0C4A2F' },
      cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#9CA3AF' },
    }
    const s = map[status]
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
        {s.label}
      </span>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          My Chats
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          All consultation sessions with your patients
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center" style={{ border: '1.5px solid #E5E7EB' }}>
          <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="font-semibold" style={{ color: '#1C1917' }}>No chats yet</p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Patient consultations will appear here once they start.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => {
            const initials = chat.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div
                key={chat.id}
                className="group flex items-center gap-3 bg-white rounded-xl px-4 py-3 transition-all hover:shadow-sm"
                style={{ border: '1.5px solid #E5E7EB', opacity: deleting === chat.id ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
              >
                <div className="shrink-0">
                  {chat.patientAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chat.patientAvatarUrl} alt={chat.patientName} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#0C4A2F' }}>
                      {initials}
                    </div>
                  )}
                </div>

                <Link href={`/doctor/chat/${chat.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: '#1C1917' }}>{chat.patientName}</span>
                    {statusBadge(chat.status)}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>
                    {chat.lastMessage ?? 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" style={{ color: '#9CA3AF' }} />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {new Date(chat.updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs" style={{ color: '#D1D5DB' }}>·</span>
                    <span className="text-xs capitalize" style={{ color: '#9CA3AF' }}>{chat.session_type.replace('_', '-')}</span>
                  </div>
                </Link>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDelete(chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-50"
                    aria-label="Remove chat"
                  >
                    <Trash2 className="w-4 h-4" style={{ color: '#C0392B' }} />
                  </button>
                  <Link href={`/doctor/chat/${chat.id}`} className="p-2 rounded-lg transition-colors hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
