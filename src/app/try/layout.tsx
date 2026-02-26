import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Try FastLane',
}

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-[var(--fl-bg)]">
      {/* Gradient accent bar */}
      <div className="fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500" />

      <main className="relative z-10 w-full max-w-lg px-4 py-12 sm:px-6">
        {children}
      </main>
    </div>
  )
}
