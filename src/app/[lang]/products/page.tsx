import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { DEFAULT_OG_IMAGE, SITE_URL, absoluteUrl, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import ProductsContent from '@/components/products/ProductsContent'

interface ProductsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/products` })
  const title = fitSeoText(`น้ำพริกเหนือ น้ำพริกพะเยาพร้อมส่ง | ${dict.site.name}`, 60)
  const description = fitSeoText(
    `เลือกซื้อน้ำพริกเหนือพรีเมียมจากพะเยา ทั้งน้ำพริกตาแดง น้ำพริกลาบ เครื่องแกง และน้ำพริกน้ำเงี้ยว เหมาะเป็นของฝากภาคเหนือ`,
    160,
  )

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.products.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
      dict.products_data.map((product) => product.name),
      dict.products_data.flatMap((product) => product.ingredients),
    ),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/products`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}/products`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'KHUA น้ำพริกเหนือพะเยา' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: dict.productsPageSeo.introTitle,
      description: dict.productsPageSeo.introParagraphs[0],
      url: `${SITE_URL}/${locale}/products`,
      inLanguage: locale,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: dict.products_data.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/${locale}/products/${product.slug}`,
          name: product.name,
        })),
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
          name: dict.products.title,
          item: `${SITE_URL}/${locale}/products`,
        },
      ],
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
            url: `${SITE_URL}/${locale}/products/${product.slug}`,
          },
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: dict.productsPageSeo.faqItems.map((item) => ({
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
      <ProductsContent dict={dict} lang={locale} />
    </>
  )
}
