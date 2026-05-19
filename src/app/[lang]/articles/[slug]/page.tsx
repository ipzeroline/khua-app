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

  return {
    title: `${article.title} | ${dict.site.name}`,
    description: article.excerpt,
    keywords: article.tags,
    alternates: { canonical: `/${locale}/articles/${slug}`, languages: alternates },
    openGraph: {
      title: `${article.title} | ${dict.site.name}`,
      description: article.excerpt,
      locale: getOpenGraphLocale(locale),
      type: 'article',
      images: article.coverImage ? [{ url: article.coverImage, alt: article.title }] : undefined,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    keywords: article.tags.join(', '),
    datePublished: '2026-05-18',
    dateModified: article.date,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailContent article={article} dict={dict} lang={locale} />
    </>
  )
}
