import generatedArticles from './articles.generated.json'
import { ArticleData, Locale } from '@/i18n/types'

type GeneratedArticles = Record<Locale, ArticleData[]>

export function getGeneratedArticles(locale: Locale): ArticleData[] {
  const articles = (generatedArticles as GeneratedArticles)[locale] ?? []
  return [...articles].sort((a, b) => b.slug.localeCompare(a.slug))
}
