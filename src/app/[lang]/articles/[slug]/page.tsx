import type { Metadata } from 'next'
import { connection } from 'next/server'
import { notFound, redirect } from 'next/navigation'
import { getDictionary, type ArticleData, type Locale, LOCALES } from '@/i18n'
import { absoluteUrl, getOpenGraphLocale } from '@/i18n/seo'
import ArticleDetailContent from '@/components/articles/ArticleDetailContent'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { getPublishedArticles } from '@/lib/articles'
import { getArticleListing } from '@/lib/article-listing'

interface ArticleDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
  searchParams?: Promise<{ q?: string; page?: string }>
}

const SHARE_IMAGE_WIDTH = 1200
const SHARE_IMAGE_HEIGHT = 630
const FACEBOOK_APP_ID = '2052165095332670'

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

function articleSeoTitle(article: ArticleData, siteName: string) {
  return fitSeoText(article.metaTitle || `${article.title} | ${siteName}`, 60)
}

function articleSeoDescription(article: ArticleData) {
  return fitSeoText(article.metaDescription || article.excerpt, 160)
}

function articleIsoDate(article: ArticleData) {
  return article.slug.match(/^daily-(\d{4}-\d{2}-\d{2})-/)?.[1] || undefined
}

function shareImageMetadata(image: string, alt: string) {
  return {
    url: absoluteUrl(image),
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    alt,
  }
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function articleWordCount(article: ArticleData) {
  return article.content
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

function extractFaqItems(article: ArticleData) {
  const faqStart = article.content.findIndex((block) => /^#\s*FAQ\s*$/i.test(block.trim()))
  if (faqStart < 0) return []

  const items: Array<{ question: string; answer: string }> = []
  let currentQuestion = ''
  let currentAnswer: string[] = []

  for (const block of article.content.slice(faqStart + 1)) {
    const text = block.trim()
    if (!text) continue
    if (text.startsWith('# ') && !text.startsWith('## ')) break
    if (text.startsWith('## ')) {
      if (currentQuestion && currentAnswer.length > 0) {
        items.push({ question: currentQuestion, answer: currentAnswer.join(' ') })
      }
      currentQuestion = text.replace(/^##\s+/, '').trim()
      currentAnswer = []
      continue
    }
    if (currentQuestion) currentAnswer.push(text)
  }

  if (currentQuestion && currentAnswer.length > 0) {
    items.push({ question: currentQuestion, answer: currentAnswer.join(' ') })
  }

  return items
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  await connection()
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const allArticles = await getPublishedArticles(locale, dict)
  const listing = getArticleListing(allArticles, locale, {}, slug)

  if (listing.categorySlug) {
    const canonical = `/${locale}/articles/${listing.categorySlug}`
    const title = fitSeoText(`${listing.category} | ${dict.articlesHub.heroTitle}`, 60)
    const description = fitSeoText(
      `${dict.articlesHub.categorySubtitle} ${dict.articlesHub.heroDescription}`,
      160,
    )
    const image = '/khua-articles-hero.png'

    const alternates: Record<string, string> = {}
    LOCALES.forEach((l) => { alternates[l] = `/${l}/articles/${listing.categorySlug}` })

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
        images: [shareImageMetadata(image, listing.category)],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteUrl(image)],
      },
    }
  }

  const article: ArticleData | undefined = allArticles.find((item) => item.slug === slug)

  if (!article) {
    return { title: dict.articles.notFound }
  }

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/articles/${slug}` })
  const title = articleSeoTitle(article, dict.site.name)
  const description = articleSeoDescription(article)
  const canonical = `/${locale}/articles/${slug}`
  const image = article.coverImage || '/khua-logo.png'
  const isoDate = articleIsoDate(article)

  return {
    title: { absolute: title },
    description,
    keywords: article.tags,
    robots: { index: true, follow: true },
    alternates: { canonical, languages: alternates },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'article',
      publishedTime: isoDate,
      modifiedTime: isoDate,
      images: [shareImageMetadata(image, article.title)],
    },
    facebook: {
      appId: FACEBOOK_APP_ID,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl(image)],
    },
  }
}

export default async function ArticleDetailPage({ params, searchParams }: ArticleDetailPageProps) {
  await connection()
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const search = await searchParams
  const allArticles = await getPublishedArticles(locale, dict)
  const requestedPage = Number.parseInt(search?.page ?? '1', 10)
  const pageParam = Number.isFinite(requestedPage) && requestedPage > 1
    ? Math.floor(requestedPage)
    : 1
  if (pageParam > 1) {
    const params = new URLSearchParams()
    if (typeof search?.q === 'string' && search.q.trim()) params.set('q', search.q.trim())
    const suffix = params.toString()
    redirect(`/${locale}/articles/${slug}/page/${pageParam}${suffix ? `?${suffix}` : ''}`)
  }

  const listing = getArticleListing(allArticles, locale, search ?? {}, slug)

  if (listing.categorySlug) {
    const canonical = `/${locale}/articles/${listing.categorySlug}`
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
        image: absoluteUrl(article.coverImage || '/khua-logo.png'),
        datePublished: article.date,
      })),
    }
    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: dict.nav.home,
          item: absoluteUrl(`/${locale}`),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: dict.nav.articles,
          item: absoluteUrl(`/${locale}/articles`),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: listing.category,
          item: absoluteUrl(canonical),
        },
      ],
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(categoryJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
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

  const article = allArticles.find((item) => item.slug === slug)

  if (!article) {
    notFound()
  }
  const canonical = `/${locale}/articles/${slug}`
  const isoDate = articleIsoDate(article)
  const image = article.coverImage || '/khua-logo.png'

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(canonical),
    },
    headline: articleSeoTitle(article, dict.site.name),
    description: articleSeoDescription(article),
    keywords: article.tags.join(', '),
    articleSection: article.category,
    wordCount: articleWordCount(article),
    datePublished: isoDate,
    dateModified: isoDate,
    inLanguage: locale,
    image: absoluteUrl(image),
    author: {
      '@type': 'Organization',
      name: dict.site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: dict.site.name,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/khua-logo.png'),
      },
    },
    articleBody: article.content.join('\n\n'),
  }
  const faqItems = extractFaqItems(article)
  const faqJsonLd = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: dict.nav.home,
        item: absoluteUrl(`/${locale}`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.nav.articles,
        item: absoluteUrl(`/${locale}/articles`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: absoluteUrl(canonical),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <ArticleDetailContent
        article={article}
        dict={dict}
        lang={locale}
        articleUrl={absoluteUrl(canonical)}
      />
    </>
  )
}
