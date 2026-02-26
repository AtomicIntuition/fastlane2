'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { PROTOCOLS, type FastingProtocol } from '@/lib/fasting/protocols'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProtocolPickerProps {
  /** Currently selected protocol ID */
  selectedProtocol: string | null
  /** Called when a protocol is selected */
  onSelect: (protocol: FastingProtocol) => void
  /** Whether the user has a Pro subscription */
  isPro?: boolean
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Difficulty badge variant map                                       */
/* ------------------------------------------------------------------ */

const difficultyVariant: Record<FastingProtocol['difficulty'], 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProtocolPicker({
  selectedProtocol,
  onSelect,
  isPro = false,
  className,
}: ProtocolPickerProps) {
  function handleSelect(protocol: FastingProtocol) {
    // Free users cannot select Pro protocols
    if (protocol.isPro && !isPro) return
    onSelect(protocol)
  }

  return (
    <div
      role="listbox"
      aria-label="Fasting protocols"
      className={cn(
        'grid grid-cols-2 gap-3 lg:grid-cols-3',
        className,
      )}
    >
      {PROTOCOLS.map((protocol) => {
        const isSelected = selectedProtocol === protocol.id
        const isLocked = protocol.isPro && !isPro

        return (
          <Card
            key={protocol.id}
            padding="sm"
            className={cn(
              'relative cursor-pointer transition-all duration-[var(--fl-transition-fast)]',
              'hover:shadow-[var(--fl-shadow-sm)]',
              isSelected &&
                'ring-2 ring-[var(--fl-primary)] border-[var(--fl-primary)]',
              isLocked &&
                'cursor-not-allowed opacity-70 hover:shadow-none',
              !isSelected &&
                !isLocked &&
                'hover:border-[var(--fl-border-hover)]',
            )}
            onClick={() => handleSelect(protocol)}
            role="option"
            tabIndex={isLocked ? -1 : 0}
            aria-selected={isSelected}
            aria-disabled={isLocked}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelect(protocol)
              }
            }}
          >
            {/* Lock overlay for Pro protocols */}
            {isLocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[var(--fl-radius-lg)] bg-[var(--fl-bg)]/60">
                <Lock size={24} className="text-[var(--fl-text-tertiary)]" />
              </div>
            )}

            <div className="flex flex-col gap-2">
              {/* Header: name + badges */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[var(--fl-text-base)] font-bold text-[var(--fl-text)]">
                  {protocol.name}
                </h3>
                <div className="flex shrink-0 items-center gap-1">
                  {protocol.isPro && (
                    <Badge variant="pro" size="sm">
                      Pro
                    </Badge>
                  )}
                </div>
              </div>

              {/* Fasting : Eating hours */}
              <div className="flex items-center gap-1">
                <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-primary)]">
                  {protocol.fastingHours}h
                </span>
                <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  fast
                </span>
                <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  /
                </span>
                <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text-secondary)]">
                  {protocol.eatingHours}h
                </span>
                <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  eat
                </span>
              </div>

              {/* Difficulty badge */}
              <Badge variant={difficultyVariant[protocol.difficulty]} size="sm" className="self-start">
                {protocol.difficulty}
              </Badge>

              {/* Description */}
              <p className="text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)] line-clamp-2">
                {protocol.description}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
