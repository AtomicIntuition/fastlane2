'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { FastingSessionData } from '@/hooks/use-fasting-session'
import { Card } from '@/components/ui/Card'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DaySummary {
  completed: number
  cancelled: number
}

interface MonthCalendarProps {
  sessions: FastingSessionData[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MonthCalendar({ sessions, selectedDate, onSelectDate }: MonthCalendarProps) {
  const today = new Date()
  const todayStr = toYMD(today)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  /* ---- Build lookup map from sessions ---- */
  const dayMap = useMemo(() => {
    const map = new Map<string, DaySummary>()
    for (const s of sessions) {
      if (s.status === 'active') continue
      const ts = s.actualEndAt ?? s.startedAt
      const dateStr = toYMD(new Date(ts))
      const entry = map.get(dateStr) ?? { completed: 0, cancelled: 0 }
      if (s.status === 'completed') entry.completed++
      else if (s.status === 'cancelled') entry.cancelled++
      map.set(dateStr, entry)
    }
    return map
  }, [sessions])

  /* ---- Build calendar grid ---- */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = firstDay.getDay() // 0 = Sunday

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const days: Array<{ date: Date; dateStr: string; inMonth: boolean }> = []

    // Leading blanks from previous month
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(viewYear, viewMonth, -startOffset + i + 1)
      days.push({ date: d, dateStr: toYMD(d), inMonth: false })
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i)
      days.push({ date: d, dateStr: toYMD(d), inMonth: true })
    }

    // Trailing blanks to fill last row
    const remainder = days.length % 7
    if (remainder > 0) {
      const fill = 7 - remainder
      for (let i = 1; i <= fill; i++) {
        const d = new Date(viewYear, viewMonth + 1, i)
        days.push({ date: d, dateStr: toYMD(d), inMonth: false })
      }
    }

    return days
  }, [viewYear, viewMonth])

  /* ---- Navigation ---- */
  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card padding="md">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-text-secondary)] transition-colors hover:bg-[var(--fl-bg-secondary)]"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
          {monthLabel}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-text-secondary)] transition-colors hover:bg-[var(--fl-bg-secondary)] disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-medium text-[var(--fl-text-tertiary)]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const isFuture = day.dateStr > todayStr
          const isToday = day.dateStr === todayStr
          const isSelected = day.dateStr === selectedDate
          const summary = dayMap.get(day.dateStr)
          const disabled = !day.inMonth || isFuture

          return (
            <button
              key={day.dateStr}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return
                onSelectDate(isSelected ? null : day.dateStr)
              }}
              className={[
                'relative flex aspect-square flex-col items-center justify-center rounded-lg text-[13px] transition-colors',
                disabled && 'opacity-30 pointer-events-none',
                !disabled && 'hover:bg-[var(--fl-bg-secondary)] cursor-pointer',
                isToday && 'ring-2 ring-[var(--fl-primary)]',
                isSelected && 'bg-[var(--fl-primary)]/10',
                day.inMonth ? 'text-[var(--fl-text)]' : 'text-[var(--fl-text-tertiary)]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="font-medium">{day.date.getDate()}</span>
              {/* Indicator dots */}
              {summary && (
                <div className="absolute bottom-[3px] flex gap-0.5">
                  {summary.completed > 0 && (
                    <span className="h-[5px] w-[5px] rounded-full bg-[var(--fl-success)]" />
                  )}
                  {summary.cancelled > 0 && (
                    <span className="h-[5px] w-[5px] rounded-full bg-[var(--fl-danger)]" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
