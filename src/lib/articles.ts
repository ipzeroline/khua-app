import pool from '@/lib/db'
import { ArticleData, Locale } from '@/i18n'
import { getGeneratedArticles } from '@/data/articles'

interface ArticleRow {
  slug: string
  cover_image_url: string | null
  published_at: Date | string | null
  title: string
  excerpt: string
  category: string
  date_label: string
  read_time: string
  tags_json: string
  highlights_json: string
  content_json: string
  meta_title?: string | null
  meta_description?: string | null
}

interface ArticleFallback {
  articles_data?: ArticleData[]
}

function hasDbConfig() {
  return Boolean(
    process.env.MARIADB_HOST &&
    process.env.MARIADB_DATABASE &&
    process.env.MARIADB_USER &&
    process.env.MARIADB_PASSWORD,
  )
}

function parseJsonArray(value: string, fallback: string[] = []) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : fallback
  } catch {
    return fallback
  }
}

function rowToArticle(row: ArticleRow): ArticleData {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.date_label,
    readTime: row.read_time,
    coverImage: row.cover_image_url ?? undefined,
    tags: parseJsonArray(row.tags_json),
    highlights: parseJsonArray(row.highlights_json),
    content: parseJsonArray(row.content_json),
  }
}

function fallbackArticles(locale: Locale, fallback?: ArticleFallback) {
  return [
    ...getGeneratedArticles(locale),
    ...(fallback?.articles_data ?? []),
  ]
}

async function queryArticles(locale: Locale, slug?: string) {
  if (!hasDbConfig()) return null

  const connection = await pool.getConnection()
  try {
    const slugClause = slug ? 'AND a.slug = ?' : ''
    const params = slug ? [locale, slug] : [locale]
    const [rows] = await connection.execute(
      `
        SELECT
          a.slug,
          a.cover_image_url,
          a.published_at,
          t.title,
          t.excerpt,
          t.category,
          t.date_label,
          t.read_time,
          t.tags_json,
          t.highlights_json,
          t.content_json,
          t.meta_title,
          t.meta_description
        FROM articles a
        INNER JOIN article_translations t ON t.article_id = a.id
        WHERE a.status = 'published'
          AND t.locale = ?
          ${slugClause}
        ORDER BY a.published_at DESC, a.id DESC
      `,
      params,
    )

    return rows as ArticleRow[]
  } finally {
    connection.release()
  }
}

export async function getPublishedArticles(locale: Locale, fallback?: ArticleFallback) {
  try {
    const rows = await queryArticles(locale)
    if (rows && rows.length > 0) {
      return rows.map(rowToArticle)
    }
  } catch (error) {
    console.warn('Falling back to local article data:', error)
  }

  return fallbackArticles(locale, fallback)
}

export async function getPublishedArticle(
  locale: Locale,
  slug: string,
  fallback?: ArticleFallback,
) {
  try {
    const rows = await queryArticles(locale, slug)
    if (rows?.[0]) {
      return rowToArticle(rows[0])
    }
  } catch (error) {
    console.warn('Falling back to local article detail:', error)
  }

  return fallbackArticles(locale, fallback).find((article) => article.slug === slug)
}
