import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  getStripe: vi.fn(),
  handleCheckoutCompleted: vi.fn(),
  handleSubscriptionUpdated: vi.fn(),
  handleSubscriptionDeleted: vi.fn(),
  handleInvoicePaid: vi.fn(),
  handleInvoicePaymentFailed: vi.fn(),
}))

vi.mock('@/lib/stripe/client', () => ({ getStripe: mocks.getStripe }))
vi.mock('@/lib/stripe/webhook-handlers', () => ({
  handleCheckoutCompleted: mocks.handleCheckoutCompleted,
  handleSubscriptionUpdated: mocks.handleSubscriptionUpdated,
  handleSubscriptionDeleted: mocks.handleSubscriptionDeleted,
  handleInvoicePaid: mocks.handleInvoicePaid,
  handleInvoicePaymentFailed: mocks.handleInvoicePaymentFailed,
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
})

describe('POST /api/stripe/webhook', () => {
  it('returns 400 for invalid signature', async () => {
    mocks.getStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => {
          throw new Error('Invalid signature')
        }),
      },
    })

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'bad_sig' },
      body: 'body',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 for checkout.session.completed', async () => {
    mocks.getStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'checkout.session.completed',
          id: 'evt_1',
          data: { object: { id: 'cs_1' } },
        })),
      },
    })
    mocks.handleCheckoutCompleted.mockResolvedValue(undefined)

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid' },
      body: 'body',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mocks.handleCheckoutCompleted).toHaveBeenCalled()
  })

  it('returns 200 even if handler throws', async () => {
    mocks.getStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'customer.subscription.updated',
          id: 'evt_2',
          data: { object: { id: 'sub_1' } },
        })),
      },
    })
    mocks.handleSubscriptionUpdated.mockRejectedValue(new Error('DB error'))

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid' },
      body: 'body',
    })
    const res = await POST(req)
    expect(res.status).toBe(200) // Always 200 to acknowledge
  })

  it('handles unrecognized event types gracefully', async () => {
    mocks.getStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'unknown.event',
          id: 'evt_3',
          data: { object: {} },
        })),
      },
    })

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid' },
      body: 'body',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
