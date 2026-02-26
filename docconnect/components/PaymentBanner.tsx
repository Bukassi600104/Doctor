'use client'

import { Lock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNaira } from '@/lib/utils'

interface PaymentBannerProps {
  amount: number
  doctorName: string
  sessionType: 'one_time' | 'subscription'
  onPay: () => void
  isLoading?: boolean
}

export function PaymentBanner({
  amount,
  doctorName,
  sessionType,
  onPay,
  isLoading = false,
}: PaymentBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#6C3CE1]/10 to-[#00D4C8]/10 border border-[#6C3CE1]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">
            {sessionType === 'subscription'
              ? `Subscribe to Dr. ${doctorName}`
              : `Session with Dr. ${doctorName}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatNaira(amount)}{' '}
            {sessionType === 'subscription' ? '/ month' : 'one-time'} • Pay to unlock chat
          </p>
        </div>
      </div>
      <Button
        onClick={onPay}
        disabled={isLoading}
        className="bg-coral hover:bg-coral-dark text-white font-semibold w-full sm:w-auto"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isLoading ? 'Processing...' : `Pay ${formatNaira(amount)}`}
      </Button>
    </div>
  )
}
