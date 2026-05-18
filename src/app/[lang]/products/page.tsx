import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
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
    title: `${dict.products.title} ราคาถูก ใกล้ฉัน | ${dict.site.name}`,
    description:
      `${dict.products.subtitle} รวมสินค้าน้ำพริกเหนือจากพะเยา เหมาะสำหรับคนที่ค้นหาน้ำพริกเชียงใหม่ น้ำพริกราคาถูก น้ำพริกใกล้ฉัน และของฝากภาคเหนือ`,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.products.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
      dict.products_data.map((product) => product.name),
      dict.products_data.flatMap((product) => product.ingredients),
    ),
    alternates: { canonical: `/${locale}/products`, languages: alternates },
    openGraph: {
      title: `${dict.products.title} | ${dict.site.name}`,
      description:
        `${dict.products.subtitle} น้ำพริกพะเยา น้ำพริกเหนือพร้อมส่งทั่วไทย`,
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
