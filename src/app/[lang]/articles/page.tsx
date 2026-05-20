import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { DEFAULT_OG_IMAGE, SITE_URL, fitSeoText, getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { getPublishedArticles } from '@/lib/articles'

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
  const title = fitSeoText(`บทความอาหารเหนือ น้ำพริกพะเยา | ${dict.site.name}`, 60)
  const description = fitSeoText(
    `อ่านบทความอาหารเหนือ น้ำพริกพะเยา เมนูอาหารเหนือ ผักพื้นบ้าน สมุนไพรล้านนา และของฝากพะเยา พร้อมแนวทางเลือกซื้อและทำอาหาร`,
    160,
  )

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      dict.articles.title,
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
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'KHUA บทความอาหารเหนือ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function ArticlesPage({ params, searchParams }: ArticlesPageProps) {
  await connection()
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const search = await searchParams
  const query = typeof search.q === 'string' ? search.q.trim() : ''
  const allArticles = await getPublishedArticles(locale, dict)
  const filteredArticles = allArticles.filter((article) => matchesArticle(article, query))
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
    url: `${SITE_URL}/${locale}/articles`,
    inLanguage: locale,
    mainEntity: allArticles.map((article) => ({
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
        articles={articles}
        query={query}
        page={page}
        totalPages={totalPages}
      />
    </>
  )
}
