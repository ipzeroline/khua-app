import type { Metadata } from 'next'
import { getDictionary, type Locale, type ProductData, LOCALES } from '@/i18n'
import { getOpenGraphLocale } from '@/i18n/seo'
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
  const keywords = Array.from(new Set([
    product.name,
    product.nameEn,
    dict.products.originValue,
    ...dict.products.seoTagsBase,
    ...product.ingredients,
  ]))

  return {
    title: `${product.name} ${dict.products.originValue} | ${dict.site.name}`,
    description: `${product.description} ${dict.products.originLabel}: ${dict.products.originValue}.`,
    keywords,
    alternates: { canonical: `/${locale}/products/${slug}`, languages: alternates },
    openGraph: {
      title: `${product.name} — ${dict.products.originValue} | ${dict.site.name}`,
      description: `${product.description} ${dict.products.originLabel}: ${dict.products.originValue}.`,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
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

  return <ProductDetailContent product={product} dict={dict} lang={locale} />
}
