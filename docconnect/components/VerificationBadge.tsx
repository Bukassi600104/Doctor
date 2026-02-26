import { cn } from '@/lib/utils'
import { BadgeCheck, Clock, XCircle } from 'lucide-react'
import type { VerificationStatus } from '@/types'

interface VerificationBadgeProps {
  status: VerificationStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const config = {
  verified: {
    label: 'MDCN Verified',
    icon: BadgeCheck,
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  pending_verification: {
    label: 'Verification Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  pending: {
    label: 'Setup Incomplete',
    icon: Clock,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  rejected: {
    label: 'Verification Failed',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export function VerificationBadge({
  status,
  size = 'md',
  className,
}: VerificationBadgeProps) {
  const { label, icon: Icon, className: statusClass } = config[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs',
        statusClass,
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      {label}
    </span>
  )
}
