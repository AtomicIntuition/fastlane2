'use client'

import { StreakCounter } from '@/components/stats/StreakCounter'
import { WeeklySummary, type WeekData } from '@/components/stats/WeeklySummary'
import { TrendChart, type TrendDataPoint } from '@/components/stats/TrendChart'
import { CalendarHeatmap, type HeatmapDay } from '@/components/stats/CalendarHeatmap'
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
  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl space-y-6">
      <h2 className="text-xl font-bold text-[var(--fl-text)]">Insights</h2>

      {/* ---- Streak Counter ---- */}
      <StreakCounter streaks={streaks} />

      {/* ---- Weekly Summary ---- */}
      <WeeklySummary thisWeek={thisWeek} lastWeek={lastWeek} />

      {/* ---- Trend Chart + Calendar Heatmap ---- */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <TrendChart data={trendData} />

        <Card padding="md">
          <h3 className="mb-4 text-[var(--fl-text-lg)] font-semibold text-[var(--fl-text)]">
            Activity Calendar
          </h3>
          <div className="overflow-x-auto">
            <CalendarHeatmap data={heatmapData} weeks={12} />
          </div>
        </Card>
      </div>
    </div>
  )
}
