import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { DEFAULT_OG_IMAGE, SITE_URL, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
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
  const title = fitSeoText(`${dict.about.title} | ${dict.site.name}`, 60)
  const description = fitSeoText(
    dict.aboutExperience.originParagraphs[0],
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
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: dict.about.title,
      description: dict.aboutExperience.originParagraphs[0],
      url: `${SITE_URL}/${locale}/about`,
      inLanguage: locale,
      mainEntity: {
        '@type': 'Brand',
        name: dict.site.name,
        description: dict.site.description,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: dict.nav.home,
          item: `${SITE_URL}/${locale}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: dict.about.label,
          item: `${SITE_URL}/${locale}/about`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: dict.aboutExperience.faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutContent dict={dict} />
    </>
  )
}
