import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'Unfed - Intermittent Fasting Made Simple',
    template: '%s | Unfed',
  },
  description:
    'Track your intermittent fasting journey with precision. Beautiful timer, smart protocols, streak tracking, and insights to help you reach your health goals.',
  keywords: [
    'intermittent fasting',
    'fasting app',
    'fasting timer',
    'health tracker',
    'weight loss',
    'autophagy',
  ],
  authors: [{ name: 'Unfed' }],
  creator: 'Unfed',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Unfed',
    title: 'Unfed - Intermittent Fasting Made Simple',
    description:
      'Track your intermittent fasting journey with precision. Beautiful timer, smart protocols, streak tracking, and insights.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unfed - Intermittent Fasting Made Simple',
    description:
      'Track your intermittent fasting journey with precision. Beautiful timer, smart protocols, streak tracking, and insights.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Unfed',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
