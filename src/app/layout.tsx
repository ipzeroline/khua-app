import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import { DEFAULT_OG_IMAGE, SITE_URL, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import './globals.css'

const notoSansThai = localFont({
  src: [
    {
      path: '../../public/fonts/NotoSansThai-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NotoSansThai-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NotoSansThai-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NotoSansThai-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-noto-sans-thai',
  display: 'swap',
})

const GA_MEASUREMENT_ID = 'G-KLKX3BJC3M'

export const metadata: Metadata = {
  title: 'KHUA — น้ำพริกพะเยา น้ำพริกตำรับล้านนา',
  description:
    'น้ำพริกพะเยา น้ำพริกเหนือพรีเมียมจากตำรับล้านนา คั่วหอมด้วยวัตถุดิบพื้นถิ่นและงานคราฟต์แบบภาคเหนือ',
  keywords: THAI_SEO_KEYWORDS,
  metadataBase: new URL(SITE_URL),
  applicationName: 'KHUA',
  authors: [{ name: 'KHUA' }],
  creator: 'KHUA',
  publisher: 'KHUA',
  category: 'อาหารเหนือ น้ำพริกพะเยา',
  alternates: {
    canonical: '/th',
    languages: {
      th: '/th',
      en: '/en',
      lo: '/lo',
      zh: '/zh',
    },
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/khua-logo.png', type: 'image/png', sizes: '1024x1024' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/khua-logo.png', type: 'image/png', sizes: '1024x1024' }],
  },
  openGraph: {
    title: 'KHUA — น้ำพริกพะเยา น้ำพริกตำรับล้านนา',
    description:
      'น้ำพริกเหนือพรีเมียมจากจังหวัดพะเยา ตำรับล้านนา เหมาะสำหรับคนไทยที่ค้นหาน้ำพริกใกล้ฉัน น้ำพริกราคาถูก และของฝากภาคเหนือ',
    url: '/th',
    siteName: 'KHUA',
    locale: 'th_TH',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'KHUA น้ำพริกพะเยา' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KHUA — น้ำพริกพะเยา น้ำพริกตำรับล้านนา',
    description: 'น้ำพริกเหนือพรีเมียมจากพะเยา ตำรับล้านนา พร้อมส่งทั่วไทย',
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">{children}</body>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </html>
  )
}
