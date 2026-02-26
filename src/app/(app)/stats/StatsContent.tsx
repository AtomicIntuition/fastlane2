'use client'

import { useApp } from '@/components/layout/AppShell'
import { StreakCounter } from '@/components/stats/StreakCounter'
import { WeeklySummary, type WeekData } from '@/components/stats/WeeklySummary'
import { TrendChart, type TrendDataPoint } from '@/components/stats/TrendChart'
import { CalendarHeatmap, type HeatmapDay } from '@/components/stats/CalendarHeatmap'
import { ProGate } from '@/components/shared/ProGate'
import { Card } from '@/components/ui/Card'
import type { StreakResult } from '@/lib/fasting/streaks'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StatsContentProps {
  streaks: StreakResult
  thisWeek: WeekData
  lastWeek: WeekData
  trendData: TrendDataPoint[]
  heatmapData: HeatmapDay[]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StatsContent({
  streaks,
  thisWeek,
  lastWeek,
  trendData,
  heatmapData,
}: StatsContentProps) {
  const { planId } = useApp()
  const isPro = planId === 'pro'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-[var(--fl-text)]">Stats</h2>

      {/* ---- Streak Counter ---- */}
      <StreakCounter streaks={streaks} />

      {/* ---- Weekly Summary ---- */}
      <WeeklySummary thisWeek={thisWeek} lastWeek={lastWeek} />

      {/* ---- Trend Chart (Pro feature) ---- */}
      <ProGate isPro={isPro} feature="Trend charts">
        <TrendChart data={trendData} />
      </ProGate>

      {/* ---- Calendar Heatmap (Pro feature) ---- */}
      <ProGate isPro={isPro} feature="Calendar heatmap">
        <Card padding="md">
          <h3 className="mb-4 text-[var(--fl-text-lg)] font-semibold text-[var(--fl-text)]">
            Activity Calendar
          </h3>
          <div className="overflow-x-auto">
            <CalendarHeatmap data={heatmapData} weeks={12} />
          </div>
        </Card>
      </ProGate>
    </div>
  )
}
