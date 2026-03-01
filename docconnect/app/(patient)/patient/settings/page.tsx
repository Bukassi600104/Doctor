'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Bell, AlertTriangle, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'security' | 'notifications' | 'account'

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'security', icon: Lock, label: 'Security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'account', icon: AlertTriangle, label: 'Account' },
]

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!fullName.trim()) { toast.error('Name is required'); return }
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSaving(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to save profile')
    } else {
      toast.success('Profile updated!')
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />)}
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
          style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Email Address</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full h-10 px-3 rounded-xl text-sm"
          style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#9CA3AF' }}
        />
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Email cannot be changed here. Contact support.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
          style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
          placeholder="+234 800 000 0000"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ background: '#0C4A2F' }}
      >
        {isSaving ? 'Saving…' : (
          <><Check className="w-4 h-4" /> Save Changes</>
        )}
      </button>
    </div>
  )
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full h-10 px-3 rounded-xl text-sm outline-none"
          style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
          placeholder="Enter current password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>New Password</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-10 px-3 pr-10 rounded-xl text-sm outline-none"
            style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showNew ? <EyeOff className="w-4 h-4" style={{ color: '#9CA3AF' }} /> : <Eye className="w-4 h-4" style={{ color: '#9CA3AF' }} />}
          </button>
        </div>
        {newPassword.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="h-1 flex-1 rounded-full" style={{ background: newPassword.length >= 8 ? '#16A34A' : '#E5E7EB' }} />
            <div className="h-1 flex-1 rounded-full" style={{ background: newPassword.length >= 12 ? '#16A34A' : '#E5E7EB' }} />
            <div className="h-1 flex-1 rounded-full" style={{ background: newPassword.length >= 16 ? '#16A34A' : '#E5E7EB' }} />
            <span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>
              {newPassword.length < 8 ? 'Weak' : newPassword.length < 12 ? 'Fair' : 'Strong'}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-10 px-3 rounded-xl text-sm outline-none"
          style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
          placeholder="Repeat new password"
        />
      </div>

      <button
        onClick={handleChangePassword}
        disabled={isSaving || !newPassword || !confirmPassword}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ background: '#0C4A2F' }}
      >
        {isSaving ? 'Updating…' : 'Update Password'}
      </button>
    </div>
  )
}

// ── Notifications Tab ─────────────────────────────────────────────────────────

interface NotifSettings {
  emailConsultation: boolean
  emailReminders: boolean
  emailMarketing: boolean
  smsConsultation: boolean
  smsReminders: boolean
}

function NotificationsTab() {
  const [settings, setSettings] = useState<NotifSettings>(() => {
    if (typeof window === 'undefined') return {
      emailConsultation: true, emailReminders: true, emailMarketing: false,
      smsConsultation: true, smsReminders: false,
    }
    try {
      const saved = localStorage.getItem('patient_notif_settings')
      return saved ? JSON.parse(saved) : {
        emailConsultation: true, emailReminders: true, emailMarketing: false,
        smsConsultation: true, smsReminders: false,
      }
    } catch {
      return { emailConsultation: true, emailReminders: true, emailMarketing: false, smsConsultation: true, smsReminders: false }
    }
  })

  const toggle = (key: keyof NotifSettings) => {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    localStorage.setItem('patient_notif_settings', JSON.stringify(next))
    toast.success('Notification preference saved')
  }

  const Toggle = ({ settingKey, label, desc }: { settingKey: keyof NotifSettings; label: string; desc: string }) => (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: '#1C1917' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => toggle(settingKey)}
        className="relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5"
        style={{ background: settings[settingKey] ? '#0C4A2F' : '#E5E7EB' }}
        aria-pressed={settings[settingKey]}
      >
        <span
          className="absolute top-1 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: settings[settingKey] ? 'translateX(1.375rem)' : 'translateX(0.125rem)' }}
        />
      </button>
    </div>
  )

  return (
    <div className="max-w-md">
      <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Email</h3>
      <Toggle settingKey="emailConsultation" label="Consultation updates" desc="When a doctor responds or your session status changes" />
      <Toggle settingKey="emailReminders" label="Appointment reminders" desc="24-hour reminders for scheduled consultations" />
      <Toggle settingKey="emailMarketing" label="Tips & promotions" desc="Health tips and special offers from DocConnect" />

      <h3 className="text-sm font-semibold mb-2 mt-5 uppercase tracking-wide" style={{ color: '#9CA3AF' }}>SMS</h3>
      <Toggle settingKey="smsConsultation" label="Consultation alerts" desc="SMS when a doctor responds to your message" />
      <Toggle settingKey="smsReminders" label="SMS reminders" desc="Text reminders for upcoming sessions" />
    </div>
  )
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  const [confirmDelete, setConfirmDelete] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSignOutAll = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    toast.success('Signed out from all devices')
    setTimeout(() => { window.location.href = '/login' }, 1000)
  }

  const handleDeleteAccount = async () => {
    if (confirmDelete !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setIsDeleting(true)
    toast.error('Account deletion requires contacting support@docconnect.ng')
    setIsDeleting(false)
  }

  return (
    <div className="space-y-6 max-w-md">
      {/* Sign out all devices */}
      <div className="rounded-xl p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#1C1917' }}>Sign Out Everywhere</h3>
        <p className="text-xs mt-1 mb-3" style={{ color: '#9CA3AF' }}>
          Signs you out of all browsers and devices where you are currently logged in.
        </p>
        <button
          onClick={handleSignOutAll}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-100"
          style={{ border: '1.5px solid #E5E7EB', color: '#1C1917' }}
        >
          Sign out all devices
        </button>
      </div>

      {/* Download data */}
      <div className="rounded-xl p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#1C1917' }}>Download Your Data</h3>
        <p className="text-xs mt-1 mb-3" style={{ color: '#9CA3AF' }}>
          Request a copy of your consultation history, documents, and profile data.
        </p>
        <button
          onClick={() => toast.info('Data export will be emailed to you within 24 hours')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-100"
          style={{ border: '1.5px solid #E5E7EB', color: '#1C1917' }}
        >
          Request data export
        </button>
      </div>

      {/* Delete account */}
      <div className="rounded-xl p-4" style={{ border: '1.5px solid rgba(192,57,43,0.2)', background: 'rgba(192,57,43,0.03)' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#C0392B' }}>Delete Account</h3>
        <p className="text-xs mt-1 mb-3" style={{ color: '#9CA3AF' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <input
          type="text"
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="w-full h-9 px-3 rounded-lg text-sm mb-3 outline-none"
          style={{ border: '1.5px solid rgba(192,57,43,0.3)', background: '#fff' }}
        />
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting || confirmDelete !== 'DELETE'}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: '#C0392B' }}
        >
          {isDeleting ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatientSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Manage your profile and account preferences</p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: '#F3F4F6' }}
      >
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            )}
            style={
              activeTab === id
                ? { background: '#fff', color: '#0C4A2F', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#6B7280' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #E5E7EB' }}>
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'account' && <AccountTab />}
      </div>
    </div>
  )
}
