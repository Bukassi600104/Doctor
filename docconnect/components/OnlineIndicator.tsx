'use client'

import { cn } from '@/lib/utils'

interface OnlineIndicatorProps {
  isOnline: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function OnlineIndicator({
  isOnline,
  size = 'md',
  showLabel = false,
  className,
}: OnlineIndicatorProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative inline-flex">
        <span
          className={cn(
            'rounded-full',
            sizes[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
        {isOnline && (
          <span
            className={cn(
              'absolute inline-flex rounded-full animate-ping opacity-75',
              sizes[size],
              'bg-green-400'
            )}
          />
        )}
      </span>
      {showLabel && (
        <span
          className={cn(
            'text-xs font-medium',
            isOnline ? 'text-green-600' : 'text-gray-400'
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  )
}
