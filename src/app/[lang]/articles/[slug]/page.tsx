import type { Metadata } from 'next'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getDictionary, type ArticleData, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale } from '@/i18n/seo'
import ArticleDetailContent from '@/components/articles/ArticleDetailContent'
import { getPublishedArticle } from '@/lib/articles'

interface ArticleDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
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

function articleSeoTitle(article: ArticleData, siteName: string) {
  return fitSeoText(article.metaTitle || `${article.title} | ${siteName}`, 60)
}

function articleSeoDescription(article: ArticleData) {
  return fitSeoText(article.metaDescription || article.excerpt, 160)
}

function articleIsoDate(article: ArticleData) {
  return article.slug.match(/^daily-(\d{4}-\d{2}-\d{2})-/)?.[1] || undefined
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  await connection()
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const article: ArticleData | undefined = await getPublishedArticle(locale, slug, dict)

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
      url: canonical,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'article',
      publishedTime: isoDate,
      modifiedTime: isoDate,
      images: [{ url: image, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  await connection()
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const article = await getPublishedArticle(locale, slug, dict)

  if (!article) {
    notFound()
  }
  const canonical = `/${locale}/articles/${slug}`
  const isoDate = articleIsoDate(article)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    headline: articleSeoTitle(article, dict.site.name),
    description: articleSeoDescription(article),
    keywords: article.tags.join(', '),
    datePublished: isoDate,
    dateModified: isoDate,
    inLanguage: locale,
    image: article.coverImage,
    author: {
      '@type': 'Organization',
      name: dict.site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: dict.site.name,
      logo: {
        '@type': 'ImageObject',
        url: '/khua-logo.png',
      },
    },
    articleBody: article.content.join('\n\n'),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: dict.nav.home,
        item: `/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.nav.articles,
        item: `/${locale}/articles`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonical,
      },
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
      <ArticleDetailContent article={article} dict={dict} lang={locale} />
    </>
  )
}
