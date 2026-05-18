import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale } from '@/i18n/seo'
import ArticlesContent from '@/components/articles/ArticlesContent'

interface ArticlesPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}

const ARTICLES_PER_PAGE = 6

function matchesArticle(
  article: { title: string; excerpt: string; category: string; tags: string[]; highlights: string[]; content: string[] },
  query: string,
) {
  if (!query) return true
  const haystack = [
    article.title,
    article.excerpt,
    article.category,
    ...article.tags,
    ...article.highlights,
    ...article.content,
  ].join(' ').toLowerCase()

  return haystack.includes(query.toLowerCase())
}

export async function generateMetadata({ params }: ArticlesPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/articles` })

  return {
    title: dict.articles.title,
    description: dict.articles.subtitle,
    keywords: Array.from(
      new Set([
        dict.articles.title,
        dict.phayaoSeo.title,
        dict.products.originValue,
        ...dict.products.seoTagsBase,
        ...dict.articles_data.flatMap((article) => article.tags),
      ]),
    ),
    alternates: { canonical: `/${locale}/articles`, languages: alternates },
    openGraph: {
      title: `${dict.articles.title} | ${dict.site.name}`,
      description: dict.articles.subtitle,
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
  }
}

export default async function ArticlesPage({ params, searchParams }: ArticlesPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const search = await searchParams
  const query = typeof search.q === 'string' ? search.q.trim() : ''
  const filteredArticles = dict.articles_data.filter((article) => matchesArticle(article, query))
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE))
  const requestedPage = Number.parseInt(search.page ?? '1', 10)
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const articles = filteredArticles.slice(
    (page - 1) * ARTICLES_PER_PAGE,
    page * ARTICLES_PER_PAGE,
  )
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dict.articles.title,
    description: dict.articles.subtitle,
    inLanguage: locale,
    mainEntity: dict.articles_data.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      keywords: article.tags.join(', '),
      datePublished: '2026-05-18',
      author: {
        '@type': 'Organization',
        name: dict.site.name,
      },
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
        articles={articles}
        query={query}
        page={page}
        totalPages={totalPages}
      />
    </>
  )
}
