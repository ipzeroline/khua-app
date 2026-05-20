import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  fitSeoText,
  getOpenGraphLocale,
  mergeKeywords,
  THAI_SEO_KEYWORDS,
} from '@/i18n/seo'
import HeroSection from '@/components/home/HeroSection'
import StorySection from '@/components/home/StorySection'
import LannaSoulSection from '@/components/home/LannaSoulSection'
import HomeRoastingSection from '@/components/home/HomeRoastingSection'
import HomeServingSection from '@/components/home/HomeServingSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CraftsmanshipSection from '@/components/home/CraftsmanshipSection'
import HomeArticlesSection from '@/components/home/HomeArticlesSection'
import PhayaoSeoSection from '@/components/home/PhayaoSeoSection'
import HomeFaqSection from '@/components/home/HomeFaqSection'

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}` })
  const title = fitSeoText(`น้ำพริกพะเยา น้ำพริกเหนือพรีเมียม | ${dict.site.name}`, 60)
  const description = fitSeoText(
    `${dict.site.name} น้ำพริกพะเยาและน้ำพริกเหนือพรีเมียมตำรับล้านนา คั่วหอม พร้อมส่งทั่วไทย เหมาะเป็นของฝากพะเยาและของฝากภาคเหนือ`,
    160,
  )

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords([
      ...THAI_SEO_KEYWORDS,
      dict.products.originValue,
      ...dict.products.seoTagsBase,
      dict.articles.homeTitle,
      dict.products.title,
    ]),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'KHUA น้ำพริกพะเยา' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const siteUrl = `${SITE_URL}/${locale}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: dict.site.name,
      url: siteUrl,
      description: dict.hero.description,
      email: dict.site.email,
      telephone: dict.site.phone,
      address: {
        '@type': 'PostalAddress',
        addressRegion: dict.products.originValue,
        addressCountry: 'TH',
      },
      areaServed: dict.products.originValue,
      sameAs: [dict.social.facebook, dict.social.instagram],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: dict.products.title,
      itemListElement: dict.products_data.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image ? absoluteUrl(product.image) : undefined,
          brand: {
            '@type': 'Brand',
            name: dict.site.name,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'THB',
            price: product.price,
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/products/${product.slug}`,
          },
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: dict.site.name,
      url: SITE_URL,
      inLanguage: locale,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/${locale}/articles?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
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
          item: siteUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: dict.faq.items.map((item) => ({
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
      <HeroSection dict={dict} />
      <PhayaoSeoSection dict={dict} />
      <StorySection dict={dict} />
      <HomeRoastingSection dict={dict} />
      <LannaSoulSection dict={dict} />
      <FeaturedProducts dict={dict} lang={locale} />
      <HomeServingSection dict={dict} />
      <HomeArticlesSection dict={dict} lang={locale} />
      <HomeFaqSection dict={dict} />
      <CraftsmanshipSection dict={dict} />
    </>
  )
}
