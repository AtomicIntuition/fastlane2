'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, Filter, X } from 'lucide-react'
import { useSessionHistory, type FastingSessionData } from '@/hooks/use-fasting-session'
import { SessionCard } from '@/components/fasting/SessionCard'
import { MonthCalendar } from '@/components/fasting/MonthCalendar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { toDateString } from '@/lib/utils/dates'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StatusFilter = 'all' | 'completed' | 'cancelled'

interface HistoryContentProps {
  initialSessions: FastingSessionData[]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HistoryContent({ initialSessions }: HistoryContentProps) {
  const { data: sessions = initialSessions } = useSessionHistory(initialSessions)

  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  /* ---- Filter sessions ---- */
  const filteredSessions = useMemo(() => {
    let result = sessions
    if (filter !== 'all') {
      result = result.filter((s) => s.status === filter)
    }
    if (selectedDate) {
      result = result.filter((s) => {
        const ts = s.actualEndAt ?? s.startedAt
        return toDateString(ts) === selectedDate
      })
    }
    return result
  }, [sessions, filter, selectedDate])

  /* ---- Filter buttons ---- */
  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl space-y-6">
      <h2 className="text-xl font-bold text-[var(--fl-text)]">History</h2>

      <div className="lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-8">
        {/* ---- Left column: Calendar ---- */}
        <div className="lg:sticky lg:top-4 space-y-3">
          <MonthCalendar
            sessions={sessions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Selected date indicator */}
          {selectedDate && (
            <div className="flex items-center justify-between rounded-lg bg-[var(--fl-primary)]/10 px-3 py-2">
              <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-primary)]">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[var(--fl-text-xs)] font-medium text-[var(--fl-primary)] transition-colors hover:bg-[var(--fl-primary)]/10"
              >
                <X size={14} />
                Show all
              </button>
            </div>
          )}
        </div>

        {/* ---- Right column: Filter + Session list ---- */}
        <div className="mt-6 lg:mt-0 space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--fl-text-tertiary)]" />
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
            <span className="ml-auto text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Session List */}
          {filteredSessions.length === 0 ? (
            <Card padding="lg" className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fl-bg-secondary)]">
                <CalendarDays size={24} className="text-[var(--fl-text-tertiary)]" />
              </div>
              <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
                No sessions yet
              </h3>
              <p className="max-w-xs text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                {filter === 'all' && !selectedDate
                  ? 'Start your first fast to see it here.'
                  : selectedDate
                    ? 'No sessions on this date. Try another day.'
                    : `No ${filter} sessions found. Try a different filter.`}
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
              {filteredSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={{
                    id: s.id,
                    protocol: s.protocol,
                    startedAt: s.startedAt,
                    targetEndAt: s.targetEndAt,
                    actualEndAt: s.actualEndAt,
                    status: s.status as 'active' | 'completed' | 'cancelled',
                    fastingHours: s.fastingHours,
                    eatingHours: s.eatingHours,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
