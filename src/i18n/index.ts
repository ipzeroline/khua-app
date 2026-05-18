import { Locale, Dictionary, DEFAULT_LOCALE, LOCALES } from './types'
import { getGeneratedArticles } from '@/data/articles'

const dictionaries: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  th: () => import('./dictionaries/th'),
  en: () => import('./dictionaries/en'),
  lo: () => import('./dictionaries/lo'),
  zh: () => import('./dictionaries/zh'),
}

export async function getDictionary(locale: Locale | string): Promise<Dictionary> {
  const normalizedLocale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE
  const loader = dictionaries[normalizedLocale]
  const mod = await loader()
  return {
    ...mod.default,
    articles_data: [
      ...getGeneratedArticles(normalizedLocale),
      ...mod.default.articles_data,
    ],
  }
}

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale)
}

export function getDefaultLocale(): Locale {
  return DEFAULT_LOCALE
}

export { type Locale, type Dictionary, LOCALES, DEFAULT_LOCALE } from './types'
export type { ArticleData, ProductData } from './types'
