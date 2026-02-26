'use client'

import { type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface ProGateProps {
  children: ReactNode
  isPro: boolean
  feature?: string
}

export function ProGate({ children, isPro, feature }: ProGateProps) {
  if (isPro) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background-elevated rounded-xl border border-border p-6 text-center shadow-lg max-w-sm mx-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Pro Feature</h3>
          <p className="text-sm text-foreground-secondary mb-4">
            {feature
              ? `${feature} is available on the Pro plan.`
              : 'Upgrade to Pro to unlock this feature.'}
          </p>
          <Link href="/upgrade">
            <Button variant="primary" size="sm" fullWidth>
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
