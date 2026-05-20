import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { DEFAULT_OG_IMAGE, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import AboutContent from '@/components/about/AboutContent'

interface AboutPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/about` })
  const title = fitSeoText(`เกี่ยวกับ KHUA น้ำพริกพะเยาตำรับล้านนา`, 60)
  const description = fitSeoText(
    `รู้จัก KHUA แบรนด์น้ำพริกพะเยาและน้ำพริกเหนือพรีเมียม ตำรับล้านนา คั่วหอมจากวัตถุดิบพื้นถิ่น เหมาะเป็นของฝากภาคเหนือ`,
    160,
  )

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.about.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
    ),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/about`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}/about`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'เกี่ยวกับ KHUA น้ำพริกพะเยา' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return <AboutContent dict={dict} />
}
