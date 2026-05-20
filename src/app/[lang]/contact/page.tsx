import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { DEFAULT_OG_IMAGE, SITE_URL, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import ContactContent from '@/components/contact/ContactContent'

interface ContactPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/contact` })
  const title = fitSeoText(`สั่งซื้อน้ำพริกพะเยา ติดต่อ KHUA`, 60)
  const description = fitSeoText(
    `ติดต่อ KHUA เพื่อสั่งซื้อน้ำพริกพะเยา น้ำพริกเหนือพรีเมียม และของฝากภาคเหนือ ผ่าน LINE พร้อมจัดส่งทั่วไทย`,
    160,
  )

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      'สั่งน้ำพริก',
      'ซื้อน้ำพริกออนไลน์',
      'น้ำพริกพร้อมส่ง',
      dict.products.originValue,
    ),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/contact`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}/contact`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'ติดต่อ KHUA' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: dict.contact.title,
    url: `${SITE_URL}/${locale}/contact`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'Organization',
      name: dict.site.name,
      url: SITE_URL,
      email: dict.site.email,
      telephone: dict.site.phone,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactContent dict={dict} />
    </>
  )
}
