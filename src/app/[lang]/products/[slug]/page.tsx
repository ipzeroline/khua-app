import type { Metadata } from 'next'
import { getDictionary, type Locale, type ProductData, LOCALES } from '@/i18n'
import { SITE_URL, absoluteUrl, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import ProductDetailContent from '@/components/products/ProductDetailContent'
import { notFound } from 'next/navigation'

interface ProductDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const product: ProductData | undefined = dict.products_data.find((p) => p.slug === slug)

  if (!product) {
    return { title: dict.products.notFound }
  }

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/products/${slug}` })
  const keywords = mergeKeywords([
    ...THAI_SEO_KEYWORDS,
    product.name,
    product.nameEn,
    `${product.name} ราคาถูก`,
    `${product.name} ใกล้ฉัน`,
    `${product.name} เชียงใหม่`,
    dict.products.originValue,
    ...dict.products.seoTagsBase,
    ...product.ingredients,
  ])
  const title = fitSeoText(`${product.name} น้ำพริกพะเยา | ${dict.site.name}`, 60)
  const description = fitSeoText(
    `${product.description} ${dict.products.originLabel}: ${dict.products.originValue}. พร้อมส่ง เหมาะเป็นของฝากพะเยาและอาหารเหนือประจำบ้าน`,
    160,
  )
  const image = product.image || '/khua-logo.png'

  return {
    title: { absolute: title },
    description,
    keywords,
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/products/${slug}`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}/products/${slug}`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const product = dict.products_data.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }
  const productUrl = `${SITE_URL}/${locale}/products/${slug}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.longDescription || product.description,
      image: product.image ? absoluteUrl(product.image) : undefined,
      brand: {
        '@type': 'Brand',
        name: dict.site.name,
      },
      category: 'Northern Thai chili paste',
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'THB',
        price: product.price,
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${locale}` },
        { '@type': 'ListItem', position: 2, name: dict.nav.products, item: `${SITE_URL}/${locale}/products` },
        { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailContent product={product} dict={dict} lang={locale} />
    </>
  )
}
