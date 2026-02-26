import { ChatWindow } from '@/components/ChatWindow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, truncate, formatRelativeTime } from '@/lib/utils'
import { Users, FileText, AlertCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientSession {
  id: string
  patientName: string
  patientAvatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  chiefComplaint?: string
}

interface PatientInfo {
  name: string
  avatar_url: string | null
  age: number
  gender: string
  bloodType: string
  allergies: string[]
  currentMedications: string[]
  medicalHistoryNote: string
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────

const PLACEHOLDER_SESSIONS: PatientSession[] = [
  {
    id: 'session-1',
    patientName: 'Chidi Okafor',
    patientAvatar: null,
    lastMessage: 'Thank you doctor, I will follow up.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadCount: 1,
    isOnline: true,
    chiefComplaint: 'Persistent headache',
  },
  {
    id: 'session-2',
    patientName: 'Aisha Mohammed',
    patientAvatar: null,
    lastMessage: 'I attached my test results.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 3,
    isOnline: true,
    chiefComplaint: 'Chest pain on exertion',
  },
  {
    id: 'session-3',
    patientName: 'Taiwo Adeyemi',
    patientAvatar: null,
    lastMessage: 'Good morning doctor.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    unreadCount: 0,
    isOnline: false,
    chiefComplaint: 'Skin rash',
  },
  {
    id: 'session-4',
    patientName: 'Ngozi Eze',
    patientAvatar: null,
    lastMessage: 'My symptoms have improved.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unreadCount: 0,
    isOnline: false,
    chiefComplaint: 'Fever and fatigue',
  },
]

const PLACEHOLDER_PATIENT: PatientInfo = {
  name: 'Chidi Okafor',
  avatar_url: null,
  age: 34,
  gender: 'Male',
  bloodType: 'O+',
  allergies: ['Penicillin', 'NSAIDs'],
  currentMedications: ['Lisinopril 10mg', 'Metformin 500mg'],
  medicalHistoryNote:
    'Patient has a history of hypertension (diagnosed 2021) and Type 2 diabetes (diagnosed 2022). No surgical history. Non-smoker. Occasional alcohol use.',
}

// ─── Session List Item ────────────────────────────────────────────────────────

function PatientSessionItem({
  session,
  isActive,
}: {
  session: PatientSession
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
          {session.patientAvatar && (
            <AvatarImage src={session.patientAvatar} alt={session.patientName} />
          )}
          <AvatarFallback className="text-white text-sm font-semibold bg-gradient-to-br from-[#FF6B6B] to-[#ff8e53]">
            {getInitials(session.patientName)}
          </AvatarFallback>
        </Avatar>
        {session.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold truncate">{session.patientName}</p>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatRelativeTime(session.lastMessageTime)}
          </span>
        </div>
        {session.chiefComplaint && (
          <p className="text-xs text-[#FF6B6B] font-medium mb-0.5">{session.chiefComplaint}</p>
        )}
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-muted-foreground truncate">
            {truncate(session.lastMessage, 38)}
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

// ─── Patient Info Card (right sidebar) ───────────────────────────────────────

function PatientInfoCard({ patient }: { patient: PatientInfo }) {
  return (
    <div className="space-y-3">
      {/* Patient Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="h-14 w-full"
          style={{ background: 'linear-gradient(135deg, #FF6B6B, #ff8e53)' }}
        />
        <div className="px-4 pb-4">
          <div className="-mt-7 mb-3">
            <Avatar className="w-14 h-14 border-4 border-white shadow">
              {patient.avatar_url && (
                <AvatarImage src={patient.avatar_url} alt={patient.name} />
              )}
              <AvatarFallback className="text-white text-base font-bold bg-gradient-to-br from-[#FF6B6B] to-[#ff8e53]">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="font-bold text-sm">{patient.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">{patient.age} yrs</Badge>
            <Badge variant="secondary" className="text-xs">{patient.gender}</Badge>
            <Badge variant="secondary" className="text-xs">Blood: {patient.bloodType}</Badge>
          </div>
        </div>
      </div>

      {/* Allergies */}
      {patient.allergies.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-xs font-semibold text-red-700">Allergies</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {patient.allergies.map((allergy) => (
              <Badge
                key={allergy}
                className="text-xs text-red-700 bg-red-100 border-red-200"
                variant="outline"
              >
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      {patient.currentMedications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-[#6C3CE1]" />
            <p className="text-xs font-semibold">Current Medications</p>
          </div>
          <ul className="space-y-1">
            {patient.currentMedications.map((med) => (
              <li key={med} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#6C3CE1] flex-shrink-0" />
                {med}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical History */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <FileText className="w-3.5 h-3.5 text-[#00D4C8]" />
          <p className="text-xs font-semibold">Medical History</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {patient.medicalHistoryNote}
        </p>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          * Placeholder — full EMR integration coming in Phase 2
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DoctorChatPage({
  params,
}: {
  params: { sessionId: string }
}) {
  // TODO: Fetch session data and current doctor user from Supabase
  const currentUserId = 'doctor-user-id' // Replace with actual auth user ID
  const currentSession = PLACEHOLDER_SESSIONS.find((s) => s.id === params.sessionId)
    ?? PLACEHOLDER_SESSIONS[0]

  const otherUser = {
    name: currentSession.patientName,
    avatar_url: currentSession.patientAvatar,
    role: 'patient' as const,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex h-screen">
        {/* Left Sidebar: Patient Session List */}
        <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 bg-white border-r border-gray-100">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6C3CE1]" />
              <h2 className="font-semibold text-sm">Active Patients</h2>
              <Badge
                className="ml-auto text-[10px] text-white px-1.5"
                style={{ background: '#FF6B6B' }}
              >
                {PLACEHOLDER_SESSIONS.reduce((sum, s) => sum + s.unreadCount, 0)}
              </Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {PLACEHOLDER_SESSIONS.map((session) => (
              <PatientSessionItem
                key={session.id}
                session={session}
                isActive={session.id === params.sessionId}
              />
            ))}
          </div>
        </aside>

        {/* Center: Chat Window */}
        <main className="flex-1 flex flex-col p-4 min-w-0">
          <ChatWindow
            sessionId={params.sessionId}
            currentUserId={currentUserId}
            otherUser={otherUser}
          />
        </main>

        {/* Right Sidebar: Patient Info + Medical History */}
        <aside className="hidden xl:block w-72 flex-shrink-0 p-4 overflow-y-auto">
          <PatientInfoCard patient={PLACEHOLDER_PATIENT} />
        </aside>
      </div>
    </div>
  )
}
