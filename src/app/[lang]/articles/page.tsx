import type { Metadata } from 'next'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { SITE_URL, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { getPublishedArticles } from '@/lib/articles'
import { getArticleCategorySlug, getArticleListing } from '@/lib/article-listing'

interface ArticlesPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ q?: string; page?: string; category?: string }>
}

export async function generateMetadata({ params }: ArticlesPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/articles` })
  const title = fitSeoText(dict.articlesHub.metaTitle, 60)
  const description = fitSeoText(dict.articlesHub.metaDescription, 160)

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.articlesHub.heroTitle,
      dict.articlesHub.categoryTitle,
      dict.articlesHub.featuredItems.map((item) => item.keyword),
      dict.articlesHub.categories.map((item) => item.title),
      dict.phayaoSeo.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
      dict.articles_data.flatMap((article) => article.tags),
    ),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/articles`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}/articles`,
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

export default async function ArticlesPage({ params, searchParams }: ArticlesPageProps) {
  await connection()
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const search = await searchParams
  const categoryParam = typeof search.category === 'string' ? search.category.trim() : ''
  const requestedPage = Number.parseInt(search.page ?? '1', 10)
  const pageParam = Number.isFinite(requestedPage) && requestedPage > 1
    ? Math.floor(requestedPage)
    : 1
  if (categoryParam) {
    const params = new URLSearchParams()
    if (typeof search.q === 'string' && search.q.trim()) params.set('q', search.q.trim())
    const suffix = params.toString()
    const categoryPath = `/${locale}/articles/${getArticleCategorySlug(categoryParam)}`
    redirect(`${pageParam > 1 ? `${categoryPath}/page/${pageParam}` : categoryPath}${suffix ? `?${suffix}` : ''}`)
  }

  if (pageParam > 1) {
    const params = new URLSearchParams()
    if (typeof search.q === 'string' && search.q.trim()) params.set('q', search.q.trim())
    const suffix = params.toString()
    redirect(`/${locale}/articles/page/${pageParam}${suffix ? `?${suffix}` : ''}`)
  }

  const allArticles = await getPublishedArticles(locale, dict)
  const listing = getArticleListing(allArticles, locale, search)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dict.articlesHub.heroTitle,
    description: dict.articlesHub.heroDescription,
    url: `${SITE_URL}/${locale}/articles`,
    inLanguage: locale,
    about: dict.articlesHub.categories.map((item) => item.title),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: dict.articlesHub.featuredItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        description: item.description,
        url: `${SITE_URL}/${locale}${item.href}`,
      })),
    },
    hasPart: allArticles.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      keywords: article.tags.join(', '),
      datePublished: article.date,
      image: article.coverImage,
      author: {
        '@type': 'Organization',
        name: dict.site.name,
      },
    })),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: dict.nav.articles, item: `${SITE_URL}/${locale}/articles` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
