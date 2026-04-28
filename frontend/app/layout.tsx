import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vacancy Portal - RCF Vacancy Coordination',
  description: 'Manage and coordinate residential care facility vacancies. Real-time vacancy status, interest registration, and follow-up tracking for owners and referring professionals.',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
