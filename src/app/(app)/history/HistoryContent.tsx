'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, Filter } from 'lucide-react'
import { useSessionHistory, type FastingSessionData } from '@/hooks/use-fasting-session'
import { SessionCard } from '@/components/fasting/SessionCard'
import { CalendarHeatmap, type HeatmapDay } from '@/components/stats/CalendarHeatmap'
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

  /* ---- Filter sessions ---- */
  const filteredSessions = useMemo(() => {
    if (filter === 'all') return sessions
    return sessions.filter((s) => s.status === filter)
  }, [sessions, filter])

  /* ---- Build heatmap data ---- */
  const heatmapData: HeatmapDay[] = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sessions) {
      if (s.status !== 'completed' || !s.actualEndAt) continue
      const dateStr = toDateString(s.actualEndAt)
      map.set(dateStr, (map.get(dateStr) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
  }, [sessions])

  /* ---- Filter buttons ---- */
  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-[var(--fl-text)]">History</h2>

      {/* ---- Calendar Heatmap ---- */}
      <Card padding="md">
        <h3 className="mb-4 text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
          Fasting Activity
        </h3>
        <div className="overflow-x-auto">
          <CalendarHeatmap data={heatmapData} weeks={12} />
        </div>
      </Card>

      {/* ---- Filter Bar ---- */}
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

      {/* ---- Session List ---- */}
      {filteredSessions.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fl-bg-secondary)]">
            <CalendarDays size={24} className="text-[var(--fl-text-tertiary)]" />
          </div>
          <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
            No sessions yet
          </h3>
          <p className="max-w-xs text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            {filter === 'all'
              ? 'Start your first fast to see it here.'
              : `No ${filter} sessions found. Try a different filter.`}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
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
  )
}
