import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, type ArticleData, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale } from '@/i18n/seo'
import ArticleDetailContent from '@/components/articles/ArticleDetailContent'

interface ArticleDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const article: ArticleData | undefined = dict.articles_data.find((item) => item.slug === slug)

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
    },
  }
}

export async function generateStaticParams() {
  const params: Array<{ lang: Locale; slug: string }> = []
  for (const lang of LOCALES) {
    const dict = await getDictionary(lang)
    dict.articles_data.forEach((article) => {
      params.push({ lang, slug: article.slug })
    })
  }
  return params
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const article = dict.articles_data.find((item) => item.slug === slug)

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
    dateModified: '2026-05-18',
    inLanguage: locale,
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
