import type { Metadata } from 'next'
import { connection } from 'next/server'
import { notFound, redirect } from 'next/navigation'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { SITE_URL, fitSeoText, getOpenGraphLocale } from '@/i18n/seo'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { getPublishedArticles } from '@/lib/articles'
import { getArticleListing } from '@/lib/article-listing'

interface ArticlesPageNumberProps {
  params: Promise<{ lang: string; page: string }>
  searchParams: Promise<{ q?: string }>
}

function parsePage(value: string) {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) ? Math.floor(page) : 1
}

export async function generateMetadata({ params }: ArticlesPageNumberProps): Promise<Metadata> {
  const { lang, page } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const pageNumber = parsePage(page)
  const canonical = pageNumber > 1 ? `/${locale}/articles/page/${pageNumber}` : `/${locale}/articles`
  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = pageNumber > 1 ? `/${l}/articles/page/${pageNumber}` : `/${l}/articles` })
  const title = fitSeoText(`${dict.articlesHub.metaTitle} | ${dict.articles.pageLabel} ${pageNumber}`, 60)
  const description = fitSeoText(dict.articlesHub.metaDescription, 160)

  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical, languages: alternates },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: '/khua-articles-hero.png', width: 1536, height: 1024, alt: dict.articlesHub.heroTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/khua-articles-hero.png'],
    },
  }
}

export default async function ArticlesPageNumber({ params, searchParams }: ArticlesPageNumberProps) {
  await connection()
  const { lang, page } = await params
  const locale = lang as Locale
  const pageNumber = parsePage(page)
  const search = await searchParams

  if (pageNumber <= 1) {
    const params = new URLSearchParams()
    if (typeof search.q === 'string' && search.q.trim()) params.set('q', search.q.trim())
    const suffix = params.toString()
    redirect(`/${locale}/articles${suffix ? `?${suffix}` : ''}`)
  }

  const dict = await getDictionary(locale)
  const allArticles = await getPublishedArticles(locale, dict)
  const listing = getArticleListing(allArticles, locale, { ...search, page: String(pageNumber) })

  if (pageNumber > listing.totalPages) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dict.articlesHub.heroTitle,
    description: dict.articlesHub.heroDescription,
    url: `${SITE_URL}/${locale}/articles/page/${pageNumber}`,
    inLanguage: locale,
    hasPart: listing.articles.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      keywords: article.tags.join(', '),
      datePublished: article.date,
      image: article.coverImage,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlesContent
        dict={dict}
        lang={locale}
        articles={listing.articles}
        query={listing.query}
        category={listing.category}
        categorySlug={listing.categorySlug}
        categories={listing.categories}
        page={listing.page}
        totalPages={listing.totalPages}
      />
    </>
  )
}
