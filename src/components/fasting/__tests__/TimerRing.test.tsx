import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TimerRing } from '@/components/fasting/TimerRing'

const defaultProps = {
  progress: 0.5,
  hours: 8,
  minutes: 30,
  seconds: 15,
  isComplete: false,
  isOvertime: false,
  overtimeMs: 0,
  protocol: '16:8',
  isActive: true,
}

describe('TimerRing', () => {
  it('renders countdown display', () => {
    render(<TimerRing {...defaultProps} />)
    expect(screen.getByText('08:30:15')).toBeInTheDocument()
  })

  it('shows protocol name', () => {
    render(<TimerRing {...defaultProps} />)
    expect(screen.getByText('16:8')).toBeInTheDocument()
  })

  it('shows "Complete!" status when isComplete is true', () => {
    render(
      <TimerRing
        {...defaultProps}
        isComplete={true}
        progress={1}
      />,
    )
    expect(screen.getByText('Complete!')).toBeInTheDocument()
  })

  it('shows overtime display when isOvertime is true', () => {
    render(
      <TimerRing
        {...defaultProps}
        isComplete={true}
        isOvertime={true}
        overtimeMs={3661000} // 1h 1m 1s
      />,
    )
    expect(screen.getByText('+01:01:01')).toBeInTheDocument()
  })

  it('shows "--:--:--" when timer is not active', () => {
    render(
      <TimerRing
        {...defaultProps}
        isActive={false}
      />,
    )
    expect(screen.getByText('--:--:--')).toBeInTheDocument()
  })

  it('shows "Ready" status when not active', () => {
    render(
      <TimerRing
        {...defaultProps}
        isActive={false}
      />,
    )
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('shows "Fasting" status when active and not complete', () => {
    render(<TimerRing {...defaultProps} />)
    expect(screen.getByText('Fasting')).toBeInTheDocument()
  })

  it('progress ring has correct stroke-dashoffset for given progress value', () => {
    const SIZE = 280
    const STROKE_WIDTH = 10
    const RADIUS = (SIZE - STROKE_WIDTH) / 2
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS

    const progress = 0.75
    const expectedOffset = CIRCUMFERENCE * (1 - progress)

    const { container } = render(
      <TimerRing {...defaultProps} progress={progress} />,
    )

    // The progress arc is the second circle element (first is the background track)
    const circles = container.querySelectorAll('circle')
    // Find the circle with strokeDasharray (the progress circle)
    const progressCircle = Array.from(circles).find(
      (circle) => circle.getAttribute('stroke-dasharray'),
    )
    expect(progressCircle).toBeDefined()

    const dashOffset = Number(progressCircle!.getAttribute('stroke-dashoffset'))
    expect(dashOffset).toBeCloseTo(expectedOffset, 1)
  })

  it('does not render protocol name when protocol is null', () => {
    render(
      <TimerRing
        {...defaultProps}
        protocol={null}
      />,
    )
    expect(screen.queryByText('16:8')).not.toBeInTheDocument()
  })
})
