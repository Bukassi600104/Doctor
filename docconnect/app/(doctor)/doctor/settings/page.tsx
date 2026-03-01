'use client'

import { useState, useEffect } from 'react'
import { User, Briefcase, DollarSign, Lock, AlertTriangle, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'professional' | 'fees' | 'security' | 'account'

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'professional', icon: Briefcase, label: 'Professional' },
  { id: 'fees', icon: DollarSign, label: 'Fees' },
  { id: 'security', icon: Lock, label: 'Security' },
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
      const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
      if (data) { setFullName(data.full_name ?? ''); setPhone(data.phone ?? '') }
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
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim(), phone: phone.trim() || null }).eq('id', user.id)
    if (error) toast.error('Failed to save profile')
    else toast.success('Profile updated!')
    setIsSaving(false)
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />)}</div>

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Full Name</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Email Address</label>
        <input type="email" value={email} disabled className="w-full h-10 px-3 rounded-xl text-sm" style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#9CA3AF' }} />
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Email cannot be changed here. Contact support.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Phone Number</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="+234 800 000 0000" />
      </div>
      <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: '#0C4A2F' }}>
        {isSaving ? 'Saving…' : <><Check className="w-4 h-4" />Save Changes</>}
      </button>
    </div>
  )
}

// ── Professional Tab ──────────────────────────────────────────────────────────

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Endocrinology', 'General Practice', 'Gynaecology', 'Internal Medicine', 'Neurology', 'Ophthalmology', 'Paediatrics', 'Psychiatry', 'Surgery', 'Other']
const STATES = ['Abuja', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara']
const LANGUAGES = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Efik', 'Fulfulde', 'Ibibio', 'Ijaw', 'Kanuri', 'Tiv']

function ProfessionalTab() {
  const [bio, setBio] = useState('')
  const [locationState, setLocationState] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [education, setEducation] = useState('')
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('doctor_profiles').select('bio, location_state, location_city, years_experience, education, languages').eq('user_id', user.id).single()
      if (data) {
        setBio(data.bio ?? '')
        setLocationState(data.location_state ?? '')
        setLocationCity(data.location_city ?? '')
        setYearsExp(String(data.years_experience ?? ''))
        setEducation(data.education ?? '')
        setSelectedLangs(data.languages ?? [])
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSaving(false); return }
    const { error } = await supabase.from('doctor_profiles').update({
      bio: bio.trim() || null,
      location_state: locationState || null,
      location_city: locationCity.trim() || null,
      years_experience: yearsExp ? Number(yearsExp) : null,
      education: education.trim() || null,
      languages: selectedLangs,
    }).eq('user_id', user.id)
    if (error) toast.error('Failed to save')
    else toast.success('Professional info updated!')
    setIsSaving(false)
  }

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang])
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />)}</div>

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="Tell patients about your experience and approach to care" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>State</label>
          <select value={locationState} onChange={(e) => setLocationState(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
            <option value="">Select state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>City</label>
          <input type="text" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="e.g. Victoria Island" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Years of Experience</label>
        <input type="number" min={0} max={60} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="e.g. 8" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Education & Qualifications</label>
        <textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="e.g. MBBS, University of Lagos; FWACP (Cardiology)" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#1C1917' }}>Languages Spoken</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button key={lang} type="button" onClick={() => toggleLang(lang)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={selectedLangs.includes(lang) ? { background: '#0C4A2F', color: '#fff' } : { background: '#F3F4F6', color: '#6B7280' }}
            >{lang}</button>
          ))}
        </div>
      </div>
      <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: '#0C4A2F' }}>
        {isSaving ? 'Saving…' : <><Check className="w-4 h-4" />Save Changes</>}
      </button>
    </div>
  )
}

// ── Fees Tab ──────────────────────────────────────────────────────────────────

function FeesTab() {
  const [oneTimeRate, setOneTimeRate] = useState('')
  const [subscriptionRate, setSubscriptionRate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('doctor_profiles').select('one_time_rate, subscription_rate').eq('user_id', user.id).single()
      if (data) {
        setOneTimeRate(data.one_time_rate ? String(data.one_time_rate) : '')
        setSubscriptionRate(data.subscription_rate ? String(data.subscription_rate) : '')
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    const ot = oneTimeRate ? Number(oneTimeRate) : null
    const sub = subscriptionRate ? Number(subscriptionRate) : null
    if (ot !== null && ot < 500) { toast.error('Minimum one-time rate is ₦500'); return }
    if (sub !== null && sub < 1000) { toast.error('Minimum subscription rate is ₦1,000'); return }
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSaving(false); return }
    const { error } = await supabase.from('doctor_profiles').update({ one_time_rate: ot, subscription_rate: sub }).eq('user_id', user.id)
    if (error) toast.error('Failed to update fees')
    else toast.success('Fees updated!')
    setIsSaving(false)
  }

  if (isLoading) return <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />)}</div>

  return (
    <div className="space-y-5 max-w-md">
      <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(12,74,47,0.04)', border: '1.5px solid rgba(12,74,47,0.12)', color: '#0C4A2F' }}>
        DocConnect retains 30% of each payment. Set your gross rates and you will receive 70%.
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>One-Time Session Rate (₦)</label>
        <input type="number" min={500} step={100} value={oneTimeRate} onChange={(e) => setOneTimeRate(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="e.g. 10000" />
        {oneTimeRate && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>You receive: ₦{(Number(oneTimeRate) * 0.7).toLocaleString()}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Monthly Subscription Rate (₦)</label>
        <input type="number" min={1000} step={500} value={subscriptionRate} onChange={(e) => setSubscriptionRate(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="e.g. 30000" />
        {subscriptionRate && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>You receive: ₦{(Number(subscriptionRate) * 0.7).toLocaleString()}/month</p>}
      </div>
      <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: '#0C4A2F' }}>
        {isSaving ? 'Saving…' : <><Check className="w-4 h-4" />Update Fees</>}
      </button>
    </div>
  )
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
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
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); setNewPassword(''); setConfirmPassword('') }
    setIsSaving(false)
  }

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>New Password</label>
        <div className="relative">
          <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="At least 8 characters" />
          <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showNew ? <EyeOff className="w-4 h-4" style={{ color: '#9CA3AF' }} /> : <Eye className="w-4 h-4" style={{ color: '#9CA3AF' }} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1917' }}>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }} placeholder="Repeat new password" />
      </div>
      <button onClick={handleChangePassword} disabled={isSaving || !newPassword || !confirmPassword} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: '#0C4A2F' }}>
        {isSaving ? 'Updating…' : 'Update Password'}
      </button>
    </div>
  )
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  const [confirmDelete, setConfirmDelete] = useState('')

  const handleSignOutAll = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    toast.success('Signed out from all devices')
    setTimeout(() => { window.location.href = '/login' }, 1000)
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="rounded-xl p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#1C1917' }}>Sign Out Everywhere</h3>
        <p className="text-xs mt-1 mb-3" style={{ color: '#9CA3AF' }}>Signs you out of all browsers and devices.</p>
        <button onClick={handleSignOutAll} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-100" style={{ border: '1.5px solid #E5E7EB', color: '#1C1917' }}>Sign out all devices</button>
      </div>
      <div className="rounded-xl p-4" style={{ border: '1.5px solid rgba(192,57,43,0.2)', background: 'rgba(192,57,43,0.03)' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#C0392B' }}>Delete Account</h3>
        <p className="text-xs mt-1 mb-3" style={{ color: '#9CA3AF' }}>Permanently deletes your account and all data. Cannot be undone.</p>
        <input type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder="Type DELETE to confirm" className="w-full h-9 px-3 rounded-lg text-sm mb-3 outline-none" style={{ border: '1.5px solid rgba(192,57,43,0.3)', background: '#fff' }} />
        <button
          disabled={confirmDelete !== 'DELETE'}
          onClick={() => toast.error('Account deletion requires contacting support@docconnect.ng')}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: '#C0392B' }}
        >
          Delete my account
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Manage your profile, professional info, and account</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto" style={{ background: '#F3F4F6' }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap')}
            style={activeTab === id ? { background: '#fff', color: '#0C4A2F', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#6B7280' }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #E5E7EB' }}>
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'professional' && <ProfessionalTab />}
        {activeTab === 'fees' && <FeesTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'account' && <AccountTab />}
      </div>
    </div>
  )
}
