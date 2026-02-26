'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  FileText,
  Check,
  User,
  Stethoscope,
  Calendar,
  CreditCard,
  ClipboardList,
  ImageIcon,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = 'English' | 'Yoruba' | 'Igbo' | 'Hausa' | 'Pidgin'
type Specialty = string

interface DaySchedule {
  enabled: boolean
  from: string
  to: string
}

interface WizardState {
  // Step 1
  full_name: string
  photo: File | null
  photoPreview: string | null
  bio: string
  languages: Language[]
  // Step 2
  mdcnCert: File | null
  mdcnCertName: string | null
  medDegree: File | null
  medDegreeName: string | null
  // Step 3
  specialty: Specialty | null
  // Step 4
  schedule: Record<string, DaySchedule>
  // Step 5
  oneTimeRate: string
  oneTimeEnabled: boolean
  subscriptionRate: string
  subscriptionEnabled: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES: Language[] = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin']

const SPECIALTIES: Specialty[] = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'ENT',
  'Ophthalmology',
  'Surgery',
  'Internal Medicine',
  'Urology',
  'Nephrology',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'Oncology',
  'Rheumatology',
  'Radiology',
  'Pathology',
  'Emergency Medicine',
  'Anesthesiology',
  'Family Medicine',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const INITIAL_SCHEDULE: Record<string, DaySchedule> = Object.fromEntries(
  DAYS.map((day) => [day, { enabled: false, from: '09:00', to: '17:00' }])
)

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Credentials', icon: FileText },
  { label: 'Specialization', icon: Stethoscope },
  { label: 'Availability', icon: Calendar },
  { label: 'Rates', icon: CreditCard },
  { label: 'Review', icon: ClipboardList },
]

// ─── File Drop Zone ───────────────────────────────────────────────────────────

function FileDropZone({
  label,
  accept,
  file,
  onChange,
  onClear,
}: {
  label: string
  accept: string
  file: File | null
  onChange: (file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onChange(dropped)
  }

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
        dragging
          ? 'border-[#6C3CE1] bg-[#6C3CE1]/5'
          : file
          ? 'border-[#00D4C8] bg-[#00D4C8]/5'
          : 'border-gray-200 hover:border-[#6C3CE1]/50 hover:bg-[#6C3CE1]/3'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f)
        }}
      />
      {file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#00D4C8]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#00D4C8]" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#6C3CE1]/10 flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5 text-[#6C3CE1]" />
          </div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click to upload · PDF, JPG, PNG
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepPersonalInfo({
  state,
  setState,
}: {
  state: WizardState
  setState: React.Dispatch<React.SetStateAction<WizardState>>
}) {
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setState((s) => ({
        ...s,
        photo: file,
        photoPreview: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const toggleLanguage = (lang: Language) => {
    setState((s) => ({
      ...s,
      languages: s.languages.includes(lang)
        ? s.languages.filter((l) => l !== lang)
        : [...s.languages, lang],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="flex items-start gap-6">
        <div
          className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#6C3CE1]/50 transition-colors flex-shrink-0"
          onClick={() => photoInputRef.current?.click()}
        >
          {state.photoPreview ? (
            <img
              src={state.photoPreview}
              alt="Profile photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-2">
              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-[10px] text-gray-400 mt-1">Photo</p>
            </div>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handlePhoto(f)
            }}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-sm font-medium">Profile Photo</Label>
          <p className="text-xs text-muted-foreground">
            Upload a professional headshot. This will be visible to patients.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
            className="mt-2"
          >
            <Upload className="w-3 h-3 mr-1.5" />
            Choose Photo
          </Button>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          placeholder="Dr. Adaeze Okonkwo"
          value={state.full_name}
          onChange={(e) => setState((s) => ({ ...s, full_name: e.target.value }))}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell patients about your experience, approach to care, and areas of expertise..."
          rows={4}
          value={state.bio}
          onChange={(e) => setState((s) => ({ ...s, bio: e.target.value }))}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {state.bio.length}/500
        </p>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label>Languages Spoken</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const selected = state.languages.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                  selected
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#6C3CE1]/40'
                )}
                style={
                  selected
                    ? { background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }
                    : {}
                }
              >
                {lang}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepCredentials({
  state,
  setState,
}: {
  state: WizardState
  setState: React.Dispatch<React.SetStateAction<WizardState>>
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-sm text-amber-700 font-medium">Important</p>
        <p className="text-xs text-amber-600 mt-0.5">
          Your credentials will be verified by MDCN within 48–72 hours. Only verified doctors can receive patients.
        </p>
      </div>

      <div className="space-y-2">
        <Label>MDCN Certificate *</Label>
        <FileDropZone
          label="Upload MDCN Certificate"
          accept=".pdf,.jpg,.jpeg,.png"
          file={state.mdcnCert}
          onChange={(file) => setState((s) => ({ ...s, mdcnCert: file, mdcnCertName: file.name }))}
          onClear={() => setState((s) => ({ ...s, mdcnCert: null, mdcnCertName: null }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Medical Degree *</Label>
        <FileDropZone
          label="Upload Medical Degree"
          accept=".pdf,.jpg,.jpeg,.png"
          file={state.medDegree}
          onChange={(file) => setState((s) => ({ ...s, medDegree: file, medDegreeName: file.name }))}
          onClear={() => setState((s) => ({ ...s, medDegree: null, medDegreeName: null }))}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Accepted formats: PDF, JPG, PNG. Maximum file size: 10 MB each.
      </p>
    </div>
  )
}

function StepSpecialization({
  state,
  setState,
}: {
  state: WizardState
  setState: React.Dispatch<React.SetStateAction<WizardState>>
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select your primary area of specialization. This determines how patients find you.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SPECIALTIES.map((spec) => {
          const selected = state.specialty === spec
          return (
            <button
              key={spec}
              type="button"
              onClick={() => setState((s) => ({ ...s, specialty: spec }))}
              className={cn(
                'relative px-3 py-3 rounded-xl text-sm font-medium border text-left transition-all',
                selected
                  ? 'border-transparent text-white shadow-md'
                  : 'border-gray-200 text-gray-700 hover:border-[#6C3CE1]/40 bg-white'
              )}
              style={
                selected
                  ? { background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }
                  : {}
              }
            >
              {selected && (
                <span className="absolute top-2 right-2">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
              {spec}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepAvailability({
  state,
  setState,
}: {
  state: WizardState
  setState: React.Dispatch<React.SetStateAction<WizardState>>
}) {
  const toggleDay = (day: string) => {
    setState((s) => ({
      ...s,
      schedule: {
        ...s.schedule,
        [day]: { ...s.schedule[day], enabled: !s.schedule[day].enabled },
      },
    }))
  }

  const updateTime = (day: string, field: 'from' | 'to', value: string) => {
    setState((s) => ({
      ...s,
      schedule: {
        ...s.schedule,
        [day]: { ...s.schedule[day], [field]: value },
      },
    }))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set your weekly availability. Patients can only book appointments during these hours.
      </p>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const d = state.schedule[day]
          return (
            <div
              key={day}
              className={cn(
                'flex items-center gap-4 p-3 rounded-xl border transition-colors',
                d.enabled ? 'border-[#6C3CE1]/30 bg-[#6C3CE1]/3' : 'border-gray-100 bg-gray-50/50'
              )}
            >
              <Checkbox
                id={`day-${day}`}
                checked={d.enabled}
                onCheckedChange={() => toggleDay(day)}
              />
              <Label
                htmlFor={`day-${day}`}
                className={cn(
                  'w-24 text-sm font-medium cursor-pointer select-none',
                  d.enabled ? 'text-[#6C3CE1]' : 'text-gray-400'
                )}
              >
                {day.slice(0, 3)}
              </Label>
              {d.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={d.from}
                    onChange={(e) => updateTime(day, 'from', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/30"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={d.to}
                    onChange={(e) => updateTime(day, 'to', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/30"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400">Not available</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepRates({
  state,
  setState,
}: {
  state: WizardState
  setState: React.Dispatch<React.SetStateAction<WizardState>>
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Set your consultation rates. DocConnect takes a 30% platform commission from each payment.
      </p>

      {/* One-time Session */}
      <div
        className={cn(
          'rounded-xl border p-4 space-y-4 transition-colors',
          state.oneTimeEnabled ? 'border-[#6C3CE1]/30 bg-[#6C3CE1]/3' : 'border-gray-200'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">One-time Session</p>
            <p className="text-xs text-muted-foreground">Charged per consultation</p>
          </div>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, oneTimeEnabled: !s.oneTimeEnabled }))}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors focus:outline-none',
              state.oneTimeEnabled ? 'bg-[#6C3CE1]' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                state.oneTimeEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
        {state.oneTimeEnabled && (
          <div className="space-y-2">
            <Label htmlFor="oneTimeRate">Price per session (NGN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                ₦
              </span>
              <Input
                id="oneTimeRate"
                type="number"
                placeholder="5,000"
                value={state.oneTimeRate}
                onChange={(e) => setState((s) => ({ ...s, oneTimeRate: e.target.value }))}
                className="pl-7"
                min="0"
              />
            </div>
            {state.oneTimeRate && (
              <p className="text-xs text-muted-foreground">
                You receive:{' '}
                <span className="text-[#6C3CE1] font-medium">
                  ₦{(Number(state.oneTimeRate) * 0.7).toLocaleString()}
                </span>{' '}
                after 30% commission
              </p>
            )}
          </div>
        )}
      </div>

      {/* Monthly Subscription */}
      <div
        className={cn(
          'rounded-xl border p-4 space-y-4 transition-colors',
          state.subscriptionEnabled ? 'border-[#00D4C8]/30 bg-[#00D4C8]/3' : 'border-gray-200'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Monthly Subscription</p>
            <p className="text-xs text-muted-foreground">Recurring monthly access for patients</p>
          </div>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, subscriptionEnabled: !s.subscriptionEnabled }))}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors focus:outline-none',
              state.subscriptionEnabled ? 'bg-[#00D4C8]' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                state.subscriptionEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
        {state.subscriptionEnabled && (
          <div className="space-y-2">
            <Label htmlFor="subscriptionRate">Monthly price (NGN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                ₦
              </span>
              <Input
                id="subscriptionRate"
                type="number"
                placeholder="15,000"
                value={state.subscriptionRate}
                onChange={(e) => setState((s) => ({ ...s, subscriptionRate: e.target.value }))}
                className="pl-7"
                min="0"
              />
            </div>
            {state.subscriptionRate && (
              <p className="text-xs text-muted-foreground">
                You receive:{' '}
                <span className="text-[#00D4C8] font-medium">
                  ₦{(Number(state.subscriptionRate) * 0.7).toLocaleString()}
                </span>{' '}
                /month after 30% commission
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StepReview({
  state,
  onSubmit,
  submitting,
}: {
  state: WizardState
  onSubmit: () => void
  submitting: boolean
}) {
  const activeDays = DAYS.filter((d) => state.schedule[d].enabled)

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Please review your information before submitting. Your profile will be reviewed within 48–72 hours.
      </p>

      {/* Personal Info */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Info</p>
        </div>
        <div className="p-4 space-y-2.5">
          <ReviewRow label="Full Name" value={state.full_name || '—'} />
          <ReviewRow label="Photo" value={state.photoPreview ? 'Uploaded' : 'Not uploaded'} />
          <ReviewRow
            label="Bio"
            value={state.bio ? `${state.bio.slice(0, 60)}${state.bio.length > 60 ? '...' : ''}` : '—'}
          />
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground w-28 flex-shrink-0">Languages</span>
            <div className="flex flex-wrap gap-1">
              {state.languages.length
                ? state.languages.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs">
                      {l}
                    </Badge>
                  ))
                : <span className="text-sm">—</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credentials</p>
        </div>
        <div className="p-4 space-y-2.5">
          <ReviewRow label="MDCN Certificate" value={state.mdcnCertName || 'Not uploaded'} />
          <ReviewRow label="Medical Degree" value={state.medDegreeName || 'Not uploaded'} />
        </div>
      </div>

      {/* Specialization */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialization</p>
        </div>
        <div className="p-4">
          <ReviewRow label="Specialty" value={state.specialty || '—'} />
        </div>
      </div>

      {/* Availability */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability</p>
        </div>
        <div className="p-4 space-y-1.5">
          {activeDays.length ? (
            activeDays.map((day) => (
              <ReviewRow
                key={day}
                label={day}
                value={`${state.schedule[day].from} – ${state.schedule[day].to}`}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No days selected</p>
          )}
        </div>
      </div>

      {/* Rates */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rates</p>
        </div>
        <div className="p-4 space-y-2.5">
          {state.oneTimeEnabled ? (
            <ReviewRow label="Per Session" value={`₦${Number(state.oneTimeRate || 0).toLocaleString()}`} />
          ) : (
            <ReviewRow label="Per Session" value="Not offered" />
          )}
          {state.subscriptionEnabled ? (
            <ReviewRow label="Monthly Sub" value={`₦${Number(state.subscriptionRate || 0).toLocaleString()}/mo`} />
          ) : (
            <ReviewRow label="Monthly Sub" value="Not offered" />
          )}
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full h-12 text-base font-semibold text-white rounded-xl"
        style={{ background: submitting ? '#ccc' : 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
      >
        {submitting ? 'Submitting...' : 'Submit for Verification'}
      </Button>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [state, setState] = useState<WizardState>({
    full_name: '',
    photo: null,
    photoPreview: null,
    bio: '',
    languages: ['English'],
    mdcnCert: null,
    mdcnCertName: null,
    medDegree: null,
    medDegreeName: null,
    specialty: null,
    schedule: INITIAL_SCHEDULE,
    oneTimeRate: '',
    oneTimeEnabled: true,
    subscriptionRate: '',
    subscriptionEnabled: false,
  })

  const totalSteps = 6
  const progress = ((step - 1) / (totalSteps - 1)) * 100

  const handleSubmit = async () => {
    setSubmitting(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in to submit.')
      setSubmitting(false)
      return
    }

    try {
      // 1. Upload profile photo (if provided)
      let avatar_url: string | null = null
      if (state.photo) {
        const ext = state.photo.name.split('.').pop()
        const { data: avatarData } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/avatar.${ext}`, state.photo, { upsert: true })
        if (avatarData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(avatarData.path)
          avatar_url = publicUrl
          await supabase.from('profiles').update({ avatar_url }).eq('id', user.id)
        }
      }

      // 2. Look up specialization_id by name
      let specialization_id: string | null = null
      if (state.specialty) {
        const { data: spec } = await supabase
          .from('specializations')
          .select('id')
          .eq('name', state.specialty)
          .single()
        specialization_id = spec?.id ?? null
      }

      // 3. Generate unique slug from full_name
      const baseSlug = 'dr-' + state.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const slug = `${baseSlug}-${user.id.slice(0, 8)}`

      // 4. Create doctor_profiles row
      const { data: dpData, error: dpError } = await supabase
        .from('doctor_profiles')
        .upsert({
          user_id: user.id,
          bio: state.bio || null,
          languages: state.languages,
          specialization_id,
          mdcn_number: null,
          verification_status: 'pending_verification',
          one_time_rate: state.oneTimeEnabled && state.oneTimeRate ? parseFloat(state.oneTimeRate) : null,
          subscription_rate: state.subscriptionEnabled && state.subscriptionRate ? parseFloat(state.subscriptionRate) : null,
          is_online: false,
          last_seen: new Date().toISOString(),
          slug,
          rating_avg: 0,
          rating_count: 0,
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (dpError) throw dpError

      // 5. Upload credentials and create credential rows
      const credFiles: Array<{ file: File | null; doc_type: 'mdcn_certificate' | 'medical_degree' }> = [
        { file: state.mdcnCert, doc_type: 'mdcn_certificate' },
        { file: state.medDegree, doc_type: 'medical_degree' },
      ]
      for (const { file, doc_type } of credFiles) {
        if (!file) continue
        const credPath = `${user.id}/${doc_type}-${Date.now()}.${file.name.split('.').pop()}`
        const { data: credStorage } = await supabase.storage
          .from('credentials')
          .upload(credPath, file)
        if (credStorage) {
          await supabase.from('credentials').insert({
            doctor_id: dpData.id,
            doc_type,
            file_url: credStorage.path,
            file_name: file.name,
            status: 'pending',
          })
        }
      }

      // 6. Create doctor_availability rows
      const dayIndex: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
      }
      const availRows = Object.entries(state.schedule)
        .filter(([, day]) => day.enabled)
        .map(([dayName, day]) => ({
          doctor_id: dpData.id,
          day_of_week: dayIndex[dayName] ?? 0,
          start_time: day.from,
          end_time: day.to,
          is_available: true,
        }))
      if (availRows.length > 0) {
        await supabase
          .from('doctor_availability')
          .upsert(availRows, { onConflict: 'doctor_id,day_of_week' })
      }

      // 7. Update profile full_name
      await supabase.from('profiles').update({ full_name: state.full_name }).eq('id', user.id)

      setSubmitted(true)
    } catch (err) {
      console.error('Onboarding submission error:', err)
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="py-16 text-center space-y-4">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
          >
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold">Application Submitted!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your profile is under review. Our team will verify your credentials within{' '}
            <strong>48–72 hours</strong>. You'll receive an email once verified.
          </p>
          <Badge
            className="mx-auto px-4 py-1.5 text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)', color: 'white' }}
          >
            Pending Verification
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const num = i + 1
          const done = num < step
          const current = num === step
          return (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    done
                      ? 'text-white shadow-md'
                      : current
                      ? 'text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-400'
                  )}
                  style={
                    done || current
                      ? { background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }
                      : {}
                  }
                >
                  {done ? <Check className="w-4 h-4" /> : num}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium hidden sm:block',
                    current ? 'text-[#6C3CE1]' : 'text-gray-400'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 transition-colors',
                    done ? 'bg-[#6C3CE1]' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1.5" />

      {/* Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
            >
              {(() => {
                const Icon = STEPS[step - 1].icon
                return <Icon className="w-5 h-5 text-white" />
              })()}
            </div>
            <div>
              <p className="font-semibold">{STEPS[step - 1].label}</p>
              <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && <StepPersonalInfo state={state} setState={setState} />}
          {step === 2 && <StepCredentials state={state} setState={setState} />}
          {step === 3 && <StepSpecialization state={state} setState={setState} />}
          {step === 4 && <StepAvailability state={state} setState={setState} />}
          {step === 5 && <StepRates state={state} setState={setState} />}
          {step === 6 && (
            <StepReview state={state} onSubmit={handleSubmit} submitting={submitting} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {step < 6 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {step} / {totalSteps}
          </span>
          <Button
            onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
            className="gap-1.5 text-white"
            style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
      {step === 6 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
        </div>
      )}
    </div>
  )
}
