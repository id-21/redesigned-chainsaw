import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vendor Photoshoot Generator',
  description: 'Generate professional product photoshoots for eCommerce apparel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
