import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
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

  return {
    title: dict.about.title,
    description: dict.about.paragraphs[0],
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.about.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
    ),
    alternates: { canonical: `/${locale}/about`, languages: alternates },
    openGraph: {
      title: `${dict.about.title} | ${dict.site.name}`,
      description: dict.about.paragraphs[0],
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return <AboutContent dict={dict} />
}
