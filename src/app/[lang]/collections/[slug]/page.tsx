import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, LOCALES, type Locale } from '@/i18n'
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  fitSeoText,
  getOpenGraphLocale,
  mergeKeywords,
  THAI_SEO_KEYWORDS,
} from '@/i18n/seo'
import ProductCard from '@/components/ui/ProductCard'

interface CollectionPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const params: Array<{ lang: string; slug: string }> = []

  for (const locale of LOCALES) {
    const dict = await getDictionary(locale)
    dict.collections_data.forEach((collection) => {
      params.push({ lang: locale, slug: collection.slug })
    })
  }

  return params
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const collection = dict.collections_data.find((item) => item.slug === slug)

  if (!collection) {
    return { title: dict.products.notFound }
  }

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => {
    alternates[l] = `/${l}/collections/${slug}`
  })

  return {
    title: { absolute: fitSeoText(collection.metaTitle, 60) },
    description: fitSeoText(collection.metaDescription, 160),
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      collection.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
      collection.sections.map((section) => section.title),
    ),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/collections/${slug}`, languages: alternates },
    openGraph: {
      title: collection.metaTitle,
      description: collection.metaDescription,
      url: `/${locale}/collections/${slug}`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: collection.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.metaTitle,
      description: collection.metaDescription,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const collection = dict.collections_data.find((item) => item.slug === slug)

  if (!collection) {
    notFound()
  }

  const relatedProducts = collection.relatedProductSlugs
    .map((productSlug) => dict.products_data.find((product) => product.slug === productSlug))
    .filter(Boolean)
    .slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.excerpt,
    url: `${SITE_URL}/${locale}/collections/${collection.slug}`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: relatedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/${locale}/products/${product!.slug}`,
        name: product!.name,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-bg pb-24 pt-32">
        <section className="px-3 sm:px-4">
          <div className="mx-auto max-w-[1480px] bg-[#241710] px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              {collection.heroEyebrow}
            </p>
            <h1 className="apple-display max-w-4xl text-5xl sm:text-7xl">
              {collection.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-white/78">
              {collection.excerpt}
            </p>
          </div>
        </section>

        <section className="px-3 py-3 sm:px-4">
          <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
              <div className="space-y-12">
                {collection.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="apple-display text-3xl text-text sm:text-4xl">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-base leading-8 text-text-secondary">
                      {section.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.links?.length ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {section.links.map((link) => (
                          <Link
                            key={link.href}
                            href={`/${locale}${link.href}`}
                            className="border border-gold/20 bg-bg/70 px-3 py-2 text-sm font-medium text-gold transition-colors hover:border-gold/40 hover:bg-gold-pale"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            </article>

            <aside className="grid content-start gap-3">
              <div className="bg-surface p-5 sm:p-7">
                <p className="apple-eyebrow text-xs uppercase text-gold/70">
                  {dict.collections.label}
                </p>
                <div className="mt-5 grid gap-2">
                  {dict.collections_data.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/${locale}/collections/${item.slug}`}
                      className="flex items-center justify-between border border-gold/15 bg-bg/60 px-4 py-3 text-sm font-medium text-text transition-colors hover:border-gold/35 hover:bg-gold-pale/45"
                    >
                      <span>{item.title}</span>
                      <span className="text-gold">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="px-3 py-3 sm:px-4">
            <div className="mx-auto max-w-[1480px] bg-[#f5f5f7] p-3">
              <div className="mb-3 bg-white px-5 py-10 text-center sm:px-8">
                <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
                  {dict.products.label}
                </p>
                <h2 className="apple-display text-4xl text-text sm:text-5xl">
                  {dict.products.title}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((product) => (
                  <ProductCard key={product!.slug} product={product!} dict={dict} lang={locale} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
