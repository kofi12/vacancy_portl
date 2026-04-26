import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Vacancy Portal - RCF Vacancy Coordination',
  description: 'Manage and coordinate residential care facility vacancies. Real-time vacancy status, interest registration, and follow-up tracking for owners and referring professionals.',
}

export const viewport: Viewport = {
  themeColor: '#2B7CB6',
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
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
