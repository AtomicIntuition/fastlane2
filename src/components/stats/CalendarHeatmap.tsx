'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HeatmapDay {
  date: string // YYYY-MM-DD
  count: number
}

export interface CalendarHeatmapProps {
  /** Array of date/count data points */
  data: HeatmapDay[]
  /** Number of weeks to display (default 12) */
  weeks?: number
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CELL_SIZE = 14
const CELL_GAP = 3
const DAY_LABEL_WIDTH = 28
const HEADER_HEIGHT = 18
const DAYS_OF_WEEK = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getColor(count: number): string {
  if (count === 0) return 'var(--fl-bg-tertiary, #e5e7eb)'
  if (count === 1) return 'var(--fl-green-300, #86efac)'
  return 'var(--fl-green-600, #16a34a)'
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CalendarHeatmap({
  data,
  weeks = 12,
  className,
}: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  // Build a lookup map of date -> count
  const countMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of data) {
      map.set(d.date, (map.get(d.date) ?? 0) + d.count)
    }
    return map
  }, [data])

  // Generate grid: 12 weeks x 7 days, ending at today
  const grid = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Total days to show: full weeks * 7, ending on today's day of week
    const totalDays = weeks * 7
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - totalDays + 1)

    // Adjust start to the nearest Sunday
    const startDow = startDate.getDay()
    startDate.setDate(startDate.getDate() - startDow)

    const columns: { date: Date; dateStr: string; count: number; dayOfWeek: number }[][] = []
    const currentDate = new Date(startDate)

    while (currentDate <= today) {
      const column: typeof columns[0] = []
      for (let dow = 0; dow < 7; dow++) {
        if (currentDate > today) {
          break
        }
        const dateStr = currentDate.toISOString().slice(0, 10)
        column.push({
          date: new Date(currentDate),
          dateStr,
          count: countMap.get(dateStr) ?? 0,
          dayOfWeek: dow,
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
      if (column.length > 0) {
        columns.push(column)
      }
    }

    return columns
  }, [countMap, weeks])

  // Compute month labels from grid columns
  const monthLabels = useMemo(() => {
    const labels: { text: string; colIndex: number }[] = []
    let lastMonth = -1
    for (let i = 0; i < grid.length; i++) {
      const firstDay = grid[i][0]
      const month = firstDay.date.getMonth()
      if (month !== lastMonth) {
        labels.push({ text: MONTH_NAMES[month], colIndex: i })
        lastMonth = month
      }
    }
    return labels
  }, [grid])

  const svgWidth = DAY_LABEL_WIDTH + grid.length * (CELL_SIZE + CELL_GAP)
  const svgHeight = HEADER_HEIGHT + 7 * (CELL_SIZE + CELL_GAP)

  return (
    <div className={cn('relative', className)}>
      <svg
        width={svgWidth}
        height={svgHeight}
        className="block overflow-visible"
        role="img"
        aria-label="Fasting activity calendar heatmap"
      >
        {/* Month labels */}
        {monthLabels.map((label, i) => (
          <text
            key={`month-${i}`}
            x={DAY_LABEL_WIDTH + label.colIndex * (CELL_SIZE + CELL_GAP)}
            y={12}
            className="fill-[var(--fl-text-tertiary)] text-[10px]"
          >
            {label.text}
          </text>
        ))}

        {/* Day labels on the left (Mon, Wed, Fri) */}
        {DAYS_OF_WEEK.map((label, i) =>
          label ? (
            <text
              key={`day-${i}`}
              x={0}
              y={HEADER_HEIGHT + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
              className="fill-[var(--fl-text-tertiary)] text-[10px]"
            >
              {label}
            </text>
          ) : null,
        )}

        {/* Grid cells */}
        {grid.map((column, colIdx) =>
          column.map((day) => {
            const x = DAY_LABEL_WIDTH + colIdx * (CELL_SIZE + CELL_GAP)
            const y = HEADER_HEIGHT + day.dayOfWeek * (CELL_SIZE + CELL_GAP)

            return (
              <rect
                key={day.dateStr}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={3}
                fill={getColor(day.count)}
                className="transition-colors duration-200 hover:stroke-[var(--fl-text)] hover:stroke-1 cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect()
                  const parent = (e.target as SVGRectElement).closest('div')?.getBoundingClientRect()
                  if (parent) {
                    setTooltip({
                      x: rect.left - parent.left + CELL_SIZE / 2,
                      y: rect.top - parent.top - 8,
                      text: `${formatDisplayDate(day.dateStr)}: ${day.count} fast${day.count !== 1 ? 's' : ''}`,
                    })
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          }),
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={cn(
            'absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none',
            'rounded-[var(--fl-radius-sm)] bg-[var(--fl-bg-elevated)] px-2 py-1',
            'text-[var(--fl-text-xs)] text-[var(--fl-text)] font-medium',
            'shadow-[var(--fl-shadow-md)] border border-[var(--fl-border)]',
            'whitespace-nowrap',
          )}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)] mr-1">Less</span>
        {[0, 1, 2].map((level) => (
          <div
            key={level}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: getColor(level) }}
          />
        ))}
        <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)] ml-1">More</span>
      </div>
    </div>
  )
}
