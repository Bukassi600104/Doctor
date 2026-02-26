import { ChatWindow } from '@/components/ChatWindow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, truncate, formatRelativeTime } from '@/lib/utils'
import { MessageSquare, Star } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionSummary {
  id: string
  doctorName: string
  doctorAvatar: string | null
  doctorSpecialty: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}

interface DoctorInfo {
  name: string
  avatar_url: string | null
  specialty: string
  rating: number
  consultations: number
  bio: string
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────

const PLACEHOLDER_SESSIONS: SessionSummary[] = [
  {
    id: 'session-1',
    doctorName: 'Dr. Adaeze Okonkwo',
    doctorAvatar: null,
    doctorSpecialty: 'General Practice',
    lastMessage: 'Thank you for sharing those results.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'session-2',
    doctorName: 'Dr. Emeka Nwosu',
    doctorAvatar: null,
    doctorSpecialty: 'Cardiology',
    lastMessage: 'Please take the medication as prescribed.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'session-3',
    doctorName: 'Dr. Fatima Bello',
    doctorAvatar: null,
    doctorSpecialty: 'Dermatology',
    lastMessage: 'I can see the rash in the photo you sent.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
]

const PLACEHOLDER_DOCTOR: DoctorInfo = {
  name: 'Dr. Adaeze Okonkwo',
  avatar_url: null,
  specialty: 'General Practice',
  rating: 4.8,
  consultations: 312,
  bio: 'MBBS (Lagos), FWACP. 12 years experience in primary and preventive care. Fluent in English, Igbo, and Yoruba.',
}

// ─── Session List Item ────────────────────────────────────────────────────────

function SessionListItem({
  session,
  isActive,
}: {
  session: SessionSummary
  isActive: boolean
}) {
  return (
    <a
      href={`/chat/${session.id}`}
      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
        isActive ? 'bg-[#6C3CE1]/5 border-l-2 border-l-[#6C3CE1]' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10">
          {session.doctorAvatar && (
            <AvatarImage src={session.doctorAvatar} alt={session.doctorName} />
          )}
          <AvatarFallback
            className="text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
          >
            {getInitials(session.doctorName)}
          </AvatarFallback>
        </Avatar>
        {session.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold truncate">{session.doctorName}</p>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatRelativeTime(session.lastMessageTime)}
          </span>
        </div>
        <p className="text-xs text-[#6C3CE1] font-medium mb-0.5">{session.doctorSpecialty}</p>
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-muted-foreground truncate">
            {truncate(session.lastMessage, 40)}
          </p>
          {session.unreadCount > 0 && (
            <Badge
              className="text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center text-white flex-shrink-0"
              style={{ background: '#FF6B6B' }}
            >
              {session.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </a>
  )
}

// ─── Doctor Info Card (right sidebar) ────────────────────────────────────────

function DoctorInfoCard({ doctor }: { doctor: DoctorInfo }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="h-16 w-full"
        style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
      />
      <div className="px-4 pb-4">
        <div className="-mt-8 mb-3">
          <Avatar className="w-16 h-16 border-4 border-white shadow">
            {doctor.avatar_url && (
              <AvatarImage src={doctor.avatar_url} alt={doctor.name} />
            )}
            <AvatarFallback
              className="text-white text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
            >
              {getInitials(doctor.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="font-bold text-base">{doctor.name}</h3>
        <p className="text-sm text-[#6C3CE1] font-medium mb-2">{doctor.specialty}</p>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold">{doctor.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {doctor.consultations.toLocaleString()} consultations
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{doctor.bio}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientChatPage({
  params,
}: {
  params: { sessionId: string }
}) {
  // TODO: Fetch session data and current user from Supabase
  const currentUserId = 'patient-user-id' // Replace with actual auth user ID
  const currentSession = PLACEHOLDER_SESSIONS.find((s) => s.id === params.sessionId)
    ?? PLACEHOLDER_SESSIONS[0]

  const otherUser = {
    name: currentSession.doctorName,
    avatar_url: currentSession.doctorAvatar,
    role: 'doctor' as const,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex h-screen">
        {/* Left Sidebar: Session List */}
        <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 bg-white border-r border-gray-100">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#6C3CE1]" />
              <h2 className="font-semibold text-sm">My Consultations</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {PLACEHOLDER_SESSIONS.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                isActive={session.id === params.sessionId}
              />
            ))}
          </div>
        </aside>

        {/* Center: Chat */}
        <main className="flex-1 flex flex-col p-4 min-w-0">
          <ChatWindow
            sessionId={params.sessionId}
            currentUserId={currentUserId}
            otherUser={otherUser}
          />
        </main>

        {/* Right Sidebar: Doctor Info */}
        <aside className="hidden xl:block w-72 flex-shrink-0 p-4 space-y-4 overflow-y-auto">
          <DoctorInfoCard doctor={PLACEHOLDER_DOCTOR} />
        </aside>
      </div>
    </div>
  )
}
