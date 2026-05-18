import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KHUA — Premium Northern Thai Chili Paste',
  description: 'Crafted Northern Soul — Premium Northern Thai chili pastes, traditional Lanna recipes, artisanal quality.',
  metadataBase: new URL('https://khua-foods.com'),
  alternates: {
    canonical: '/',
    languages: {
      th: '/th',
      en: '/en',
      lo: '/lo',
      zh: '/zh',
    },
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
