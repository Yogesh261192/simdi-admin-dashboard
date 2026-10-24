import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SIMDI Admin Dashboard',
  description: 'Customer communication and campaign dashboard for Simdi.in',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f7f1ea', color: '#2d241d', fontFamily: 'Arial, sans-serif' }}>{children}</body>
    </html>
  )
}
