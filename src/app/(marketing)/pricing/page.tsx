import type { Metadata } from 'next'
import { PricingTable } from '@/components/marketing/PricingTable'
import { CTA } from '@/components/marketing/CTA'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing. Start free and upgrade to Pro for advanced fasting protocols, unlimited history, and detailed analytics.',
}

export default function PricingPage() {
  return (
    <>
      <div className="pt-24">
        <PricingTable />
      </div>
      <CTA />
    </>
  )
}
