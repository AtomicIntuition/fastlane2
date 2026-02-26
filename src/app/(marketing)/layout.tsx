import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { Footer } from '@/components/marketing/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MarketingHeader />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}
