'use client'

import { useMemo } from 'react'
import { Clock, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatDuration, formatDate, formatTime } from '@/lib/utils/dates'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SessionStatus = 'active' | 'completed' | 'cancelled'

export interface FastingSession {
  id: string
  protocol: string
  startedAt: number
  targetEndAt: number
  actualEndAt: number | null
  status: SessionStatus
  fastingHours: number
  eatingHours: number
}

export interface SessionCardProps {
  /** The fasting session data */
  session: FastingSession
  /** Called when the card is clicked */
  onClick?: () => void
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const statusConfig: Record<
  SessionStatus,
  { label: string; variant: BadgeVariant; icon: typeof CheckCircle2 }
> = {
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
  active: { label: 'Active', variant: 'info', icon: Zap },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SessionCard({ session, onClick, className }: SessionCardProps) {
  const { label, variant, icon: StatusIcon } = statusConfig[session.status]

  // Calculate actual duration
  const endTime = useMemo(() => session.actualEndAt ?? session.targetEndAt, [session.actualEndAt, session.targetEndAt])
  const actualDurationMs = endTime - session.startedAt
  const targetDurationMs = session.targetEndAt - session.startedAt

  // Completion percentage
  const completionPct = targetDurationMs > 0
    ? Math.min(100, Math.round((actualDurationMs / targetDurationMs) * 100))
    : 0

  return (
    <Card
      padding="sm"
      className={cn(
        'transition-all duration-[var(--fl-transition-fast)]',
        onClick && 'cursor-pointer hover:border-[var(--fl-border-hover)] hover:shadow-[var(--fl-shadow-sm)]',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-2.5">
        {/* Top row: protocol name + status badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="truncate text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
              {session.protocol}
            </h3>
            <span className="shrink-0 text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              {session.fastingHours}:{session.eatingHours}
            </span>
          </div>
          <Badge variant={variant} size="sm" className="shrink-0">
            <StatusIcon size={12} className="mr-1" />
            {label}
          </Badge>
        </div>

        {/* Middle row: date + time and duration */}
        <div className="flex items-center justify-between text-[var(--fl-text-sm)]">
          <div className="flex items-center gap-1 text-[var(--fl-text-secondary)]">
            <Clock size={14} className="shrink-0" />
            <span>{formatDate(session.startedAt)}</span>
            <span className="text-[var(--fl-text-tertiary)]">at</span>
            <span>{formatTime(session.startedAt)}</span>
          </div>
          <span className="font-semibold tabular-nums text-[var(--fl-text)]">
            {formatDuration(actualDurationMs)}
          </span>
        </div>

        {/* Bottom: completion bar (only for completed/cancelled sessions) */}
        {session.status !== 'active' && (
          <Progress
            value={completionPct}
            color={session.status === 'completed' ? 'success' : 'danger'}
            trackHeight="h-1.5"
            showPercentage
          />
        )}
      </div>
    </Card>
  )
}
