'use client'

import { Card } from '@/components/ui/Card'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TrendDataPoint {
  /** Day label (e.g. "Mon", "Tue") */
  day: string
  /** Fasting hours for this day */
  hours: number
}

export interface TrendChartProps {
  /** Array of daily data points (last 7 days) */
  data: TrendDataPoint[]
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CHART_HEIGHT = 140
const BAR_MIN_HEIGHT = 4
const BAR_RADIUS = 4

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TrendChart({ data, className }: TrendChartProps) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1)
  const barCount = data.length || 1

  // SVG dimensions
  const padding = { top: 20, bottom: 30, left: 4, right: 4 }
  const svgWidth = 100 // We use viewBox + 100% width for responsiveness
  const chartWidth = svgWidth - padding.left - padding.right
  const barSpacing = chartWidth / barCount
  const barWidth = Math.min(barSpacing * 0.6, 14)

  return (
    <Card
      padding="md"
      header={
        <h3 className="text-[var(--fl-text-lg)] font-semibold text-[var(--fl-text)]">
          Daily Fasting Trend
        </h3>
      }
      className={className}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${CHART_HEIGHT + padding.top + padding.bottom}`}
        className="w-full h-auto"
        role="img"
        aria-label="Daily fasting hours trend chart"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Horizontal guide lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = padding.top + CHART_HEIGHT * (1 - fraction)
          return (
            <line
              key={fraction}
              x1={padding.left}
              y1={y}
              x2={svgWidth - padding.right}
              y2={y}
              stroke="var(--fl-bg-tertiary, #e5e7eb)"
              strokeWidth={0.3}
              strokeDasharray={fraction > 0 && fraction < 1 ? '1,1' : '0'}
            />
          )
        })}

        {/* Max hours label */}
        <text
          x={padding.left}
          y={padding.top - 4}
          className="fill-[var(--fl-text-tertiary)]"
          style={{ fontSize: '3.5px' }}
        >
          {maxHours}h
        </text>

        {/* Bars */}
        {data.map((point, i) => {
          const barHeight = point.hours > 0
            ? Math.max(
                (point.hours / maxHours) * CHART_HEIGHT,
                BAR_MIN_HEIGHT,
              )
            : 0

          const x = padding.left + barSpacing * i + (barSpacing - barWidth) / 2
          const y = padding.top + CHART_HEIGHT - barHeight

          return (
            <g key={`${point.day}-${i}`}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={BAR_RADIUS > barWidth / 2 ? barWidth / 2 : BAR_RADIUS}
                ry={BAR_RADIUS > barWidth / 2 ? barWidth / 2 : BAR_RADIUS}
                fill={point.hours > 0 ? 'var(--fl-primary, #22c55e)' : 'var(--fl-bg-tertiary, #e5e7eb)'}
                className="transition-all duration-500"
                opacity={point.hours > 0 ? 1 : 0.4}
              />

              {/* Hour value above bar */}
              {point.hours > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 3}
                  textAnchor="middle"
                  className="fill-[var(--fl-text-secondary)]"
                  style={{ fontSize: '3.5px', fontWeight: 600 }}
                >
                  {point.hours % 1 === 0 ? point.hours : point.hours.toFixed(1)}
                </text>
              )}

              {/* Day label at bottom */}
              <text
                x={x + barWidth / 2}
                y={padding.top + CHART_HEIGHT + 12}
                textAnchor="middle"
                className="fill-[var(--fl-text-tertiary)]"
                style={{ fontSize: '3.5px', fontWeight: 500 }}
              >
                {point.day}
              </text>
            </g>
          )
        })}

        {/* Zero-value empty state placeholder bars */}
        {data.every((d) => d.hours === 0) && (
          <text
            x={svgWidth / 2}
            y={padding.top + CHART_HEIGHT / 2}
            textAnchor="middle"
            className="fill-[var(--fl-text-tertiary)]"
            style={{ fontSize: '5px' }}
          >
            No fasts this week
          </text>
        )}
      </svg>
    </Card>
  )
}
