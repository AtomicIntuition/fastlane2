'use client'

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
        const isProProtocol = protocol.isPro && !isPro

        return (
          <Card
            key={protocol.id}
            padding="sm"
            className={cn(
              'relative cursor-pointer transition-all duration-[var(--fl-transition-fast)]',
              'hover:shadow-[var(--fl-shadow-sm)]',
              isSelected &&
                'ring-2 ring-[var(--fl-primary)] border-[var(--fl-primary)]',
              !isSelected &&
                'hover:border-[var(--fl-border-hover)]',
            )}
            onClick={() => onSelect(protocol)}
            role="option"
            tabIndex={0}
            aria-selected={isSelected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(protocol)
              }
            }}
          >
            <div className="flex flex-col gap-2">
              {/* Header: name + badges */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[var(--fl-text-base)] font-bold text-[var(--fl-text)]">
                  {protocol.name}
                </h3>
                <div className="flex shrink-0 items-center gap-1">
                  {isProProtocol && (
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
