import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import HeroSection from '@/components/home/HeroSection'
import StorySection from '@/components/home/StorySection'
import LannaSoulSection from '@/components/home/LannaSoulSection'
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

  return {
    title: `${dict.hero.title} | ${dict.site.name}`,
    description: dict.hero.description,
    keywords: mergeKeywords([
      ...THAI_SEO_KEYWORDS,
      dict.products.originValue,
      ...dict.products.seoTagsBase,
      dict.articles.homeTitle,
      dict.products.title,
    ]),
    alternates: { canonical: `/${locale}`, languages: alternates },
    openGraph: {
      title: `${dict.site.name} — ${dict.site.tagline}`,
      description: dict.site.description,
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const siteUrl = `https://khua-foods.com/${locale}`
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
          image: product.image ? `https://khua-foods.com${product.image}` : undefined,
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
      <LannaSoulSection dict={dict} />
      <FeaturedProducts dict={dict} lang={locale} />
      <HomeArticlesSection dict={dict} lang={locale} />
      <HomeFaqSection dict={dict} />
      <CraftsmanshipSection dict={dict} />
    </>
  )
}
