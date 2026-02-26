'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Mail, Lock, Eye, EyeOff, Loader2, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setIsLoading(false)
      toast.error(error.message ?? 'Login failed. Please check your credentials.')
      return
    }

    if (!data.user) {
      setIsLoading(false)
      toast.error('Something went wrong. Please try again.')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setIsLoading(false)
      toast.error('Could not load your profile. Please try again.')
      return
    }

    toast.success('Welcome back!')

    if (profile.role === 'doctor') {
      router.push('/doctor/dashboard')
    } else if (profile.role === 'admin') {
      router.push('/admin/verification')
    } else {
      router.push('/patient/dashboard')
    }
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
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Log in to your DocConnect account
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
            onClick={() => setRole(r)}
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
            {r === 'patient' ? 'Login as Patient' : 'Login as Doctor'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: '#0C6B4E' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10 pr-10 h-10 rounded-xl text-sm"
              style={{ border: '1.5px solid #E5E7EB' }}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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
              Signing in…
            </>
          ) : (
            `Log in as ${role === 'doctor' ? 'Doctor' : 'Patient'}`
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" style={{ borderColor: '#E5E7EB' }} />
        </div>
        <div className="relative flex justify-center text-xs" style={{ color: '#9CA3AF' }}>
          <span className="px-3" style={{ background: '#FAFAFA' }}>or</span>
        </div>
      </div>

      <p className="text-sm text-center" style={{ color: '#6B7280' }}>
        Don&apos;t have an account?{' '}
        <Link
          href={`/register${role === 'doctor' ? '?role=doctor' : ''}`}
          className="font-semibold hover:underline"
          style={{ color: '#0C6B4E' }}
        >
          Register
        </Link>
      </p>
    </div>
  )
}
