import type { Metadata } from 'next'
import { connection } from 'next/server'
import { notFound, redirect } from 'next/navigation'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { absoluteUrl, getOpenGraphLocale } from '@/i18n/seo'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { getPublishedArticles } from '@/lib/articles'
import { getArticleListing } from '@/lib/article-listing'

interface CategoryPageNumberProps {
  params: Promise<{ lang: string; slug: string; page: string }>
  searchParams: Promise<{ q?: string }>
}

function compactText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function fitSeoText(value: string, maxLength: number) {
  const text = compactText(value)
  if (text.length <= maxLength) return text

  const sliced = text.slice(0, maxLength - 1).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  const safe = lastSpace > 42 ? sliced.slice(0, lastSpace) : sliced
  return `${safe.replace(/[|,.;:，。]+$/, '')}…`
}

function parsePage(value: string) {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) ? Math.floor(page) : 1
}

export async function generateMetadata({ params }: CategoryPageNumberProps): Promise<Metadata> {
  await connection()
  const { lang, slug, page } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const allArticles = await getPublishedArticles(locale, dict)
  const pageNumber = parsePage(page)
  const listing = getArticleListing(allArticles, locale, { page: String(pageNumber) }, slug)

  if (!listing.categorySlug) return { title: dict.articles.notFound }

  const canonical = pageNumber > 1
    ? `/${locale}/articles/${listing.categorySlug}/page/${pageNumber}`
    : `/${locale}/articles/${listing.categorySlug}`
  const title = fitSeoText(`${listing.category} | ${dict.articles.pageLabel} ${pageNumber}`, 60)
  const description = fitSeoText(
    `${dict.articlesHub.categorySubtitle} ${dict.articlesHub.heroDescription}`,
    160,
  )
  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => {
    alternates[l] = pageNumber > 1
      ? `/${l}/articles/${listing.categorySlug}/page/${pageNumber}`
      : `/${l}/articles/${listing.categorySlug}`
  })

  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical, languages: alternates },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: absoluteUrl('/khua-articles-hero.png'), alt: listing.category }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/khua-articles-hero.png')],
    },
  }
}

export default async function CategoryPageNumber({ params, searchParams }: CategoryPageNumberProps) {
  await connection()
  const { lang, slug, page } = await params
  const locale = lang as Locale
  const pageNumber = parsePage(page)
  const search = await searchParams

  if (pageNumber <= 1) {
    const params = new URLSearchParams()
    if (typeof search.q === 'string' && search.q.trim()) params.set('q', search.q.trim())
    const suffix = params.toString()
    redirect(`/${locale}/articles/${slug}${suffix ? `?${suffix}` : ''}`)
  }

  const dict = await getDictionary(locale)
  const allArticles = await getPublishedArticles(locale, dict)
  const listing = getArticleListing(allArticles, locale, { ...search, page: String(pageNumber) }, slug)

  if (!listing.categorySlug || pageNumber > listing.totalPages) notFound()

  const canonical = `/${locale}/articles/${listing.categorySlug}/page/${pageNumber}`
  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: listing.category,
    description: dict.articlesHub.categorySubtitle,
    url: absoluteUrl(canonical),
    inLanguage: locale,
    hasPart: listing.articles.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: article.coverImage,
      datePublished: article.date,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
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
