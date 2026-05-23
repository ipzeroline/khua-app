import { ArticleData, Locale } from '@/i18n/types'

export const ARTICLES_PER_PAGE = 7

const CATEGORY_SLUG_ALIASES = new Map<string, string>(
  [
    ['สูตรอาหารเหนือ', 'northern-thai-recipes'],
    ['northern thai recipes', 'northern-thai-recipes'],
    ['ສູດອາຫານເໜືອ', 'northern-thai-recipes'],
    ['泰北食谱', 'northern-thai-recipes'],
    ['วัฒนธรรมล้านนา', 'lanna-culture'],
    ['lanna culture', 'lanna-culture'],
    ['ວັດທະນະທຳລ້ານນາ', 'lanna-culture'],
    ['兰纳文化', 'lanna-culture'],
    ['เคล็ดลับอาหารเหนือ', 'northern-thai-cooking-tips'],
    ['northern thai cooking tips', 'northern-thai-cooking-tips'],
    ['ຄຳແນະນຳອາຫານເໜືອ', 'northern-thai-cooking-tips'],
    ['泰北料理技巧', 'northern-thai-cooking-tips'],
    ['อาหารพื้นเมืองพะเยา', 'phayao-local-food'],
    ['phayao local food', 'phayao-local-food'],
    ['ອາຫານພື້ນເມືອງພະເຍົາ', 'phayao-local-food'],
    ['帕尧地方美食', 'phayao-local-food'],
    ['ผักพื้นบ้านเหนือ', 'northern-local-vegetables'],
    ['northern local vegetables', 'northern-local-vegetables'],
    ['ຜັກພື້ນບ້ານເໜືອ', 'northern-local-vegetables'],
    ['泰北地方蔬菜', 'northern-local-vegetables'],
    ['เครื่องเทศล้านนา', 'lanna-spices'],
    ['lanna spices', 'lanna-spices'],
    ['ສະໝຸນໄພລ້ານນາ', 'lanna-spices'],
    ['兰纳香料', 'lanna-spices'],
  ].map(([label, slug]) => [label.toLowerCase(), slug]),
)

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  'northern-thai-recipes': {
    th: 'สูตรอาหารเหนือ',
    en: 'Northern Thai Recipes',
    lo: 'ສູດອາຫານເໜືອ',
    zh: '泰北食谱',
  },
  'lanna-culture': {
    th: 'วัฒนธรรมล้านนา',
    en: 'Lanna Culture',
    lo: 'ວັດທະນະທຳລ້ານນາ',
    zh: '兰纳文化',
  },
  'northern-thai-cooking-tips': {
    th: 'เคล็ดลับอาหารเหนือ',
    en: 'Northern Thai Cooking Tips',
    lo: 'ຄຳແນະນຳອາຫານເໜືອ',
    zh: '泰北料理技巧',
  },
  'phayao-local-food': {
    th: 'อาหารพื้นเมืองพะเยา',
    en: 'Phayao Local Food',
    lo: 'ອາຫານພື້ນເມືອງພະເຍົາ',
    zh: '帕尧地方美食',
  },
  'northern-local-vegetables': {
    th: 'ผักพื้นบ้านเหนือ',
    en: 'Northern Local Vegetables',
    lo: 'ຜັກພື້ນບ້ານເໜືອ',
    zh: '泰北地方蔬菜',
  },
  'lanna-spices': {
    th: 'เครื่องเทศล้านนา',
    en: 'Lanna Spices',
    lo: 'ສະໝຸນໄພລ້ານນາ',
    zh: '兰纳香料',
  },
}

export interface ArticleCategory {
  label: string
  slug: string
  count: number
}

export function fallbackCategorySlug(category: string) {
  const ascii = category
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (ascii) return ascii

  let hash = 0
  for (const char of category) {
    hash = Math.imul(31, hash) + char.charCodeAt(0)
    hash |= 0
  }

  return `topic-${Math.abs(hash).toString(36)}`
}

export function getArticleCategorySlug(category: string) {
  const normalized = category.trim().toLowerCase()
  return CATEGORY_SLUG_ALIASES.get(normalized) ?? fallbackCategorySlug(category)
}

export function getKnownCategoryLabel(slug: string, locale: Locale) {
  return CATEGORY_LABELS[slug]?.[locale] ?? ''
}

export function buildArticleCategories(articles: ArticleData[], locale: Locale) {
  const categoryMap = new Map<string, ArticleCategory>()
  articles.forEach((article) => {
    if (!article.category) return
    const slug = getArticleCategorySlug(article.category)
    const existing = categoryMap.get(slug)
    categoryMap.set(slug, {
      label: existing?.label ?? article.category,
      slug,
      count: (existing?.count ?? 0) + 1,
    })
  })

  return Array.from(categoryMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  )
}

export function resolveArticleCategory(
  categoryParam: string,
  categories: ArticleCategory[],
  locale: Locale,
) {
  if (!categoryParam) return { label: '', slug: '' }
  const slug = getArticleCategorySlug(categoryParam)
  const selectedCategory = categories.find((item) => item.slug === slug)
  if (selectedCategory) return { label: selectedCategory.label, slug: selectedCategory.slug }

  const label = getKnownCategoryLabel(slug, locale)
  return label ? { label, slug } : { label: '', slug: '' }
}

export function matchesArticle(
  article: ArticleData,
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

export function getArticleListing(
  allArticles: ArticleData[],
  locale: Locale,
  search: { q?: string; page?: string },
  categoryParam = '',
) {
  const query = typeof search.q === 'string' ? search.q.trim() : ''
  const categories = buildArticleCategories(allArticles, locale)
  const selectedCategory = resolveArticleCategory(categoryParam, categories, locale)
  const filteredArticles = allArticles.filter((article) =>
    matchesArticle(article, query) &&
    (!selectedCategory.label || getArticleCategorySlug(article.category) === selectedCategory.slug),
  )
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE))
  const requestedPage = Number.parseInt(search.page ?? '1', 10)
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const articles = filteredArticles.slice(
    (page - 1) * ARTICLES_PER_PAGE,
    page * ARTICLES_PER_PAGE,
  )

  return {
    articles,
    categories,
    query,
    category: selectedCategory.label,
    categorySlug: selectedCategory.slug,
    page,
    totalPages,
  }
}
