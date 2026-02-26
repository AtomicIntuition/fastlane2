import { Hero } from '@/components/marketing/Hero'
import { Features } from '@/components/marketing/Features'
import { Testimonials } from '@/components/marketing/Testimonials'
import { PricingTable } from '@/components/marketing/PricingTable'
import { CTA } from '@/components/marketing/CTA'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <PricingTable />
      <CTA />
    </>
  )
}
