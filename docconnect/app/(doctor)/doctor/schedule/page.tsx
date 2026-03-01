'use client'

import { useState, useEffect } from 'react'
import { Calendar, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface DaySchedule {
  day_of_week: number
  is_available: boolean
  start_time: string
  end_time: string
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((_, i) => ({
  day_of_week: i,
  is_available: i >= 1 && i <= 5, // Mon-Fri available by default
  start_time: '09:00',
  end_time: '17:00',
}))

export default function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null)

  useEffect(() => {
    loadSchedule()
  }, [])

  async function loadSchedule() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: dp } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!dp) { setIsLoading(false); return }
    setDoctorProfileId(dp.id)

    const { data: availability } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', dp.id)

    if (availability?.length) {
      // Merge with defaults
      const merged = DEFAULT_SCHEDULE.map((def) => {
        const existing = availability.find((a: DaySchedule) => a.day_of_week === def.day_of_week)
        return existing ? { ...def, ...existing } : def
      })
      setSchedule(merged)
    }

    setIsLoading(false)
  }

  async function handleSave() {
    if (!doctorProfileId) { toast.error('Doctor profile not found'); return }
    setIsSaving(true)
    const supabase = createClient()

    const rows = schedule.map((s) => ({
      doctor_id: doctorProfileId,
      day_of_week: s.day_of_week,
      is_available: s.is_available,
      start_time: s.start_time,
      end_time: s.end_time,
    }))

    const { error } = await supabase
      .from('doctor_availability')
      .upsert(rows, { onConflict: 'doctor_id,day_of_week' })

    if (error) {
      toast.error('Failed to save schedule')
    } else {
      toast.success('Schedule saved!')
    }
    setIsSaving(false)
  }

  function updateDay(dayIndex: number, field: keyof DaySchedule, value: boolean | string) {
    setSchedule((prev) =>
      prev.map((d) => d.day_of_week === dayIndex ? { ...d, [field]: value } : d)
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
        >
          My Schedule
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Set your weekly availability for patient consultations
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm mb-5" style={{ border: '1.5px solid #E5E7EB' }}>
        <div className="space-y-3">
          {schedule.map((day) => (
            <div
              key={day.day_of_week}
              className="flex flex-wrap items-center gap-3 py-3"
              style={{ borderBottom: '1px solid #F3F4F6' }}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => updateDay(day.day_of_week, 'is_available', !day.is_available)}
                className="relative inline-flex h-5 w-9 rounded-full transition-colors shrink-0"
                style={{ background: day.is_available ? '#0C4A2F' : '#E5E7EB' }}
                aria-pressed={day.is_available}
              >
                <span
                  className="absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: day.is_available ? 'translateX(1.25rem)' : 'translateX(0.125rem)' }}
                />
              </button>

              {/* Day name */}
              <span
                className="w-24 text-sm font-medium"
                style={{ color: day.is_available ? '#1C1917' : '#9CA3AF' }}
              >
                {DAYS[day.day_of_week]}
              </span>

              {/* Times */}
              {day.is_available ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => updateDay(day.day_of_week, 'start_time', e.target.value)}
                    className="h-8 px-2 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
                  />
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>to</span>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => updateDay(day.day_of_week, 'end_time', e.target.value)}
                    className="h-8 px-2 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}
                  />
                </div>
              ) : (
                <span className="text-sm" style={{ color: '#9CA3AF' }}>Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Online status quick toggle */}
      <div className="rounded-xl p-4 mb-5" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" style={{ color: '#0C4A2F' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>Online Status</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              Toggle this from your dashboard to appear online to patients right now.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ background: '#0C4A2F' }}
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving…' : 'Save Schedule'}
      </button>
    </div>
  )
}
