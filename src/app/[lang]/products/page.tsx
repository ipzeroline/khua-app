import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale } from '@/i18n/seo'
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

  return {
    title: dict.products.title,
    description: dict.site.description,
    alternates: { canonical: `/${locale}/products`, languages: alternates },
    openGraph: {
      title: `${dict.products.title} | ${dict.site.name}`,
      description: dict.site.description,
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
  }
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return <ProductsContent dict={dict} lang={locale} />
}
