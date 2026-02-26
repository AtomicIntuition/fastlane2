import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/Button'

// Mock lucide-react Loader2 icon
vi.mock('lucide-react', () => ({
  Loader2: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="loader-icon" className={className} width={size} />
  ),
}))

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner when loading prop is true', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire click when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        No click
      </Button>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies correct classes for primary variant', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-[var(--fl-primary)]')
  })

  it('applies correct classes for secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-[var(--fl-secondary)]')
  })

  it('applies correct classes for outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
    expect(button.className).toContain('border')
  })

  it('applies correct classes for ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
  })

  it('applies correct classes for danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-[var(--fl-danger)]')
  })

  it('applies fullWidth class when fullWidth prop is true', () => {
    render(<Button fullWidth>Full width</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('w-full')
  })

  it('renders left icon when provided', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">L</span>}>
        With icon
      </Button>,
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon when provided', () => {
    render(
      <Button rightIcon={<span data-testid="right-icon">R</span>}>
        With icon
      </Button>,
    )
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
})
