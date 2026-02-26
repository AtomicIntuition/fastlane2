'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/Card'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WeekData {
  totalHours: number
  totalFasts: number
  avgDuration: number // in hours
}

export interface WeeklySummaryProps {
  /** Current week data */
  thisWeek: WeekData
  /** Previous week data */
  lastWeek: WeekData
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface ComparisonItem {
  label: string
  current: string
  previous: string
  diff: number
  unit: string
}

function formatHours(h: number): string {
  return h % 1 === 0 ? `${h}` : h.toFixed(1)
}

function getDiff(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/* ------------------------------------------------------------------ */
/*  Comparison arrow component                                         */
/* ------------------------------------------------------------------ */

function TrendIndicator({ diff }: { diff: number }) {
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-tertiary)]">
        <Minus size={12} />
        <span>0%</span>
      </span>
    )
  }

  const isUp = diff > 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[var(--fl-text-xs)] font-medium',
        isUp ? 'text-[var(--fl-success)]' : 'text-[var(--fl-danger)]',
      )}
    >
      {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      <span>{Math.abs(diff)}%</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WeeklySummary({ thisWeek, lastWeek, className }: WeeklySummaryProps) {
  const comparisons: ComparisonItem[] = [
    {
      label: 'Fasting Hours',
      current: formatHours(thisWeek.totalHours),
      previous: formatHours(lastWeek.totalHours),
      diff: getDiff(thisWeek.totalHours, lastWeek.totalHours),
      unit: 'h',
    },
    {
      label: 'Total Fasts',
      current: String(thisWeek.totalFasts),
      previous: String(lastWeek.totalFasts),
      diff: getDiff(thisWeek.totalFasts, lastWeek.totalFasts),
      unit: '',
    },
    {
      label: 'Avg Duration',
      current: formatHours(thisWeek.avgDuration),
      previous: formatHours(lastWeek.avgDuration),
      diff: getDiff(thisWeek.avgDuration, lastWeek.avgDuration),
      unit: 'h',
    },
  ]

  return (
    <Card
      padding="md"
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-[var(--fl-text-lg)] font-semibold text-[var(--fl-text)]">
            Weekly Summary
          </h3>
          <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
            vs last week
          </span>
        </div>
      }
      className={className}
    >
      <div className="grid grid-cols-3 gap-4">
        {comparisons.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 text-center">
            {/* Current value */}
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold tabular-nums text-[var(--fl-text)]">
                {item.current}
              </span>
              {item.unit && (
                <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text-secondary)]">
                  {item.unit}
                </span>
              )}
            </div>

            {/* Label */}
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
              {item.label}
            </span>

            {/* Trend indicator */}
            <TrendIndicator diff={item.diff} />

            {/* Previous value (small) */}
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              was {item.previous}{item.unit}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
