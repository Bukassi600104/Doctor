'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Phone, User, Loader2, Stethoscope, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const baseSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Enter a valid Nigerian phone number')
    .regex(/^(\+234|0)[789]\d{9}$/, 'Enter a valid Nigerian phone number (e.g. 08012345678)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
})

const patientSchema = baseSchema.refine(
  (data) => data.password === data.confirm_password,
  { message: 'Passwords do not match', path: ['confirm_password'] }
)

const doctorSchema = baseSchema.refine(
  (data) => data.password === data.confirm_password,
  { message: 'Passwords do not match', path: ['confirm_password'] }
)

type RegisterFormValues = z.infer<typeof patientSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto h-96 animate-pulse rounded-2xl" style={{ background: '#E5E7EB' }} />}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient'

  const [role, setRole] = useState<'patient' | 'doctor'>(initialRole)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(role === 'doctor' ? doctorSchema : patientSchema),
  })

  const onRoleChange = (newRole: 'patient' | 'doctor') => {
    setRole(newRole)
    reset()
  }

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true)
    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name, phone: values.phone, role },
      },
    })

    if (signUpError) {
      setIsLoading(false)
      toast.error(signUpError.message ?? 'Registration failed. Please try again.')
      return
    }

    if (!authData.user) {
      setIsLoading(false)
      toast.error('Something went wrong. Please try again.')
      return
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      role,
    })

    if (profileError) {
      console.error('Profile insert error:', profileError.message)
    }

    toast.success('Account created! Please log in to continue.')
    router.push('/login')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Heading */}
      <div className="mb-7">
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
            color: '#1C1917',
          }}
        >
          Create your account
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Join thousands of Nigerians getting quality healthcare
        </p>
      </div>

      {/* Role switcher */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: '#E8F5EE', border: '1.5px solid #C6E0D3' }}
      >
        {(['patient', 'doctor'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRoleChange(r)}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold transition-all duration-200"
            style={
              role === r
                ? { background: '#0C4A2F', color: '#fff', boxShadow: '0 1px 4px rgba(12,74,47,0.25)' }
                : { color: '#0C4A2F' }
            }
          >
            {r === 'patient' ? (
              <HeartPulse className="w-3.5 h-3.5" />
            ) : (
              <Stethoscope className="w-3.5 h-3.5" />
            )}
            {r === 'patient' ? "I'm a Patient" : "I'm a Doctor"}
          </button>
        ))}
      </div>

      {role === 'doctor' && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ border: '1.5px solid rgba(12,74,47,0.25)', background: 'rgba(12,74,47,0.05)', color: '#0C4A2F' }}
        >
          <span className="font-semibold">Note:</span> After registration you will complete a 6-step onboarding wizard
          including MDCN credential upload. Verification takes 48–72 hours.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="full_name" style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>
            Full name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <Input
              id="full_name"
              type="text"
              placeholder="Amara Okonkwo"
              autoComplete="name"
              className="pl-10 h-10 rounded-xl text-sm"
              style={{ border: '1.5px solid #E5E7EB' }}
              {...register('full_name')}
            />
          </div>
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10 h-10 rounded-xl text-sm"
              style={{ border: '1.5px solid #E5E7EB' }}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>
            Phone number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <Input
              id="phone"
              type="tel"
              placeholder="08012345678"
              autoComplete="tel"
              className="pl-10 h-10 rounded-xl text-sm"
              style={{ border: '1.5px solid #E5E7EB' }}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="pl-10 pr-10 h-10 rounded-xl text-sm"
              style={{ border: '1.5px solid #E5E7EB' }}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
              style={{ color: '#9CA3AF' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm_password" style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <Input
              id="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="pl-10 pr-10 h-10 rounded-xl text-sm"
              style={{ border: '1.5px solid #E5E7EB' }}
              {...register('confirm_password')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
              style={{ color: '#9CA3AF' }}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity mt-2"
          style={{ background: '#0C4A2F' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account…
            </>
          ) : role === 'doctor' ? (
            'Create Doctor Account'
          ) : (
            'Create Patient Account'
          )}
        </Button>

        <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
          By registering you agree to our{' '}
          <Link href="/terms" className="underline hover:opacity-80" style={{ color: '#0C6B4E' }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:opacity-80" style={{ color: '#0C6B4E' }}>
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: '#6B7280' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: '#0C6B4E' }}>
          Log in
        </Link>
      </p>
    </div>
  )
}
