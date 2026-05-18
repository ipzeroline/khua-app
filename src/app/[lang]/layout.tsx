import type { Metadata } from 'next'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { CartProvider } from '@/components/cart/CartProvider'
import { getDictionary, LOCALES, type Locale } from '@/i18n'
import { getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import { notFound } from 'next/navigation'

interface LangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => {
    alternates[l] = `/${l}`
  })

  return {
    title: {
      default: `${dict.site.name} — ${dict.site.tagline}`,
      template: `%s | ${dict.site.name}`,
    },
    description: dict.site.description,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.products.originValue,
      dict.products.seoTagsBase,
      dict.products_data.map((product) => product.name),
    ),
    alternates: {
      canonical: `/${lang}`,
      languages: alternates,
    },
    openGraph: {
      title: `${dict.site.name} — ${dict.site.tagline}`,
      description: dict.site.description,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(lang),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dict.site.name} — ${dict.site.tagline}`,
      description: dict.site.description,
    },
  }
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params
  const locale = lang as Locale

  if (!LOCALES.includes(locale)) {
    notFound()
  }

  const dict = await getDictionary(locale)

  return (
    <CartProvider>
      <div className="font-[family-name:var(--font-apple)]">
        <Navbar dict={dict} lang={locale} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict} />
      </div>
    </CartProvider>
  )
}
