import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Apprentice — Track Your Journey',
  description: 'Manage apprenticeship programs, track progress, and connect mentors with apprentices.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
