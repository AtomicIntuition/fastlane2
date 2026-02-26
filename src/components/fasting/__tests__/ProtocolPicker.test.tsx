import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProtocolPicker } from '@/components/fasting/ProtocolPicker'
import { PROTOCOLS } from '@/lib/fasting/protocols'

// Mock lucide-react Lock icon
vi.mock('lucide-react', () => ({
  Lock: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="lock-icon" width={size} className={className} />
  ),
}))

describe('ProtocolPicker', () => {
  it('renders all protocols', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol={null}
        onSelect={onSelect}
        isPro={true}
      />,
    )
    PROTOCOLS.forEach((protocol) => {
      expect(screen.getByText(protocol.name)).toBeInTheDocument()
    })
  })

  it('highlights selected protocol', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol="16-8"
        onSelect={onSelect}
        isPro={true}
      />,
    )
    // The selected card has aria-selected="true"
    const selectedCard = screen.getByText('16:8').closest('[aria-selected]')
    expect(selectedCard).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onSelect when protocol clicked', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol={null}
        onSelect={onSelect}
        isPro={true}
      />,
    )
    // Click on the 16:8 protocol name's parent card
    const protocolCard = screen.getByText('16:8').closest('[role="option"]')
    fireEvent.click(protocolCard!)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: '16-8', name: '16:8' }),
    )
  })

  it('shows lock on pro protocols for free users', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol={null}
        onSelect={onSelect}
        isPro={false}
      />,
    )
    const lockIcons = screen.getAllByTestId('lock-icon')
    const proProtocols = PROTOCOLS.filter((p) => p.isPro)
    expect(lockIcons).toHaveLength(proProtocols.length)
  })

  it('does not call onSelect for locked pro protocols when isPro is false', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol={null}
        onSelect={onSelect}
        isPro={false}
      />,
    )
    // Click on a pro-only protocol (20:4 Warrior)
    const proProtocolCard = screen.getByText('20:4 (Warrior)').closest('[role="option"]')
    fireEvent.click(proProtocolCard!)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('marks locked protocols as aria-disabled', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol={null}
        onSelect={onSelect}
        isPro={false}
      />,
    )
    const proProtocolCard = screen.getByText('20:4 (Warrior)').closest('[role="option"]')
    expect(proProtocolCard).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not show lock icons when user is pro', () => {
    const onSelect = vi.fn()
    render(
      <ProtocolPicker
        selectedProtocol={null}
        onSelect={onSelect}
        isPro={true}
      />,
    )
    expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument()
  })
})
