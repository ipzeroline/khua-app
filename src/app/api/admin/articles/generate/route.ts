import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import { requirePermission, AuthContext } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

type GeneratedArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  tags: string[]
  highlights: string[]
  content: string[]
}

type ArticleGenerator = {
  addDays: (date: string, amount: number) => string
  buildArticle: (date: string, locale: string) => GeneratedArticle
  generateCoverImage: (
    slug: string,
    article: GeneratedArticle,
  ) => Promise<{ coverImageUrl: string; imagePrompt: string }>
  todayBangkok: () => string
}

async function loadGenerator(): Promise<ArticleGenerator> {
  return import('../../../../../../scripts/generate-daily-articles.mjs') as Promise<ArticleGenerator>
}

interface LatestArticleRow extends RowDataPacket {
  slug: string
}

export async function POST() {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const ctx = auth as AuthContext
  const generator = await loadGenerator()
  const connection = await pool.getConnection()

  try {
    const [latestRows] = await connection.execute<LatestArticleRow[]>(`
      SELECT slug FROM articles
      WHERE slug LIKE 'daily-%'
      ORDER BY published_at DESC, id DESC
      LIMIT 1
    `)
    const latestSlug = latestRows[0]?.slug
    const latestDate = latestSlug?.match(/^daily-(\d{4}-\d{2}-\d{2})-/)?.[1]
    const today = generator.todayBangkok()
    const date = latestDate ? generator.addDays(latestDate, 1) : today
    const locales = ['th', 'en', 'lo', 'zh']
    const localizedArticles = Object.fromEntries(
      locales.map((locale) => [locale, generator.buildArticle(date, locale)]),
    ) as Record<string, GeneratedArticle>
    const primary = localizedArticles.th ?? Object.values(localizedArticles)[0]
    const { coverImageUrl, imagePrompt } = await generator.generateCoverImage(primary.slug, primary)

    await connection.beginTransaction()

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO articles (slug, status, cover_image_url, image_prompt, published_at, author_id)
       VALUES (?, 'draft', ?, ?, ?, ?)`,
      [primary.slug, coverImageUrl, imagePrompt, `${date} 08:00:00`, ctx.user.id],
    )
    const articleId = result.insertId

    for (const locale of locales) {
      const article = localizedArticles[locale]
      await connection.execute(
        `INSERT INTO article_translations
         (article_id, locale, title, excerpt, category, date_label, read_time, tags_json, highlights_json, content_json, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          articleId,
          locale,
          article.title,
          article.excerpt,
          article.category,
          article.date,
          article.readTime,
          JSON.stringify(article.tags),
          JSON.stringify(article.highlights),
          JSON.stringify(article.content),
          article.title,
          article.excerpt,
        ],
      )
    }

    await connection.commit()
    return Response.json({ id: articleId, slug: primary.slug, cover_image_url: coverImageUrl }, { status: 201 })
  } catch (error) {
    await connection.rollback()
    console.error('Generate article error:', error)
    return Response.json({ error: 'Failed to generate article' }, { status: 500 })
  } finally {
    connection.release()
  }
}
