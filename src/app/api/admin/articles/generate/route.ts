import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { NextRequest } from 'next/server'
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
  researchImageBrief?: string
}

type ArticleGenerator = {
  addDays: (date: string, amount: number) => string
  buildArticle: (date: string, locale: string, brief?: string, category?: string) => GeneratedArticle
  generateResearchedArticleSet?: (
    date: string,
    brief?: string,
    category?: string,
  ) => Promise<{ articles: Record<string, GeneratedArticle>; researchImageBrief?: string } | null>
  getGeneratedTopicCount: () => number
  generateCoverImage: (
    slug: string,
    article: GeneratedArticle,
  ) => Promise<{
    coverImageUrl: string
    imagePrompt: string
    fallback?: boolean
    generated?: boolean
    reason?: string
    reused?: boolean
  }>
  todayBangkok: () => string
}

async function loadGenerator(): Promise<ArticleGenerator> {
  return import('../../../../../../scripts/generate-daily-articles.mjs') as Promise<ArticleGenerator>
}

interface LatestArticleRow extends RowDataPacket {
  slug: string
}

interface ExistingArticleRow extends RowDataPacket {
  slug: string
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const ctx = auth as AuthContext
  const body = await request.json().catch(() => ({})) as { brief?: unknown; category?: unknown }
  const brief = typeof body.brief === 'string' ? body.brief.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  if (brief.length > 800) {
    return Response.json({ error: 'Generation detail must be 800 characters or fewer' }, { status: 400 })
  }
  if (!category) {
    return Response.json({ error: 'Category is required' }, { status: 400 })
  }
  if (category.length > 100) {
    return Response.json({ error: 'Category must be 100 characters or fewer' }, { status: 400 })
  }

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
    const [existingRows] = await connection.execute<ExistingArticleRow[]>(`
      SELECT a.slug
      FROM articles a
      WHERE a.slug LIKE 'daily-%'
    `)
    const existingSlugs = new Set(existingRows.map((row) => row.slug))

    const today = generator.todayBangkok()
    let date = latestDate ? generator.addDays(latestDate, 1) : today
    let localizedArticles: Record<string, GeneratedArticle> | null = null
    const locales = ['th', 'en', 'lo', 'zh']

    for (let attempt = 0; attempt < generator.getGeneratedTopicCount(); attempt += 1) {
      const researched = await generator.generateResearchedArticleSet?.(date, brief, category)
      const candidate = researched?.articles ?? Object.fromEntries(
        locales.map((locale) => [locale, generator.buildArticle(date, locale, brief, category)]),
      ) as Record<string, GeneratedArticle>
      const primaryCandidate = candidate.th ?? Object.values(candidate)[0]

      if (!existingSlugs.has(primaryCandidate.slug)) {
        localizedArticles = candidate
        break
      }

      date = generator.addDays(date, 1)
    }

    if (!localizedArticles) {
      return Response.json(
        {
          error:
            'All generated article templates have already been used. Add more article templates before generating again.',
        },
        { status: 409 },
      )
    }

    const primary = localizedArticles.th ?? Object.values(localizedArticles)[0]
    const imageResult = await generator.generateCoverImage(primary.slug, primary)
    const { coverImageUrl, imagePrompt } = imageResult

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
    return Response.json(
      {
        id: articleId,
        slug: primary.slug,
        cover_image_url: coverImageUrl,
        image: {
          fallback: Boolean(imageResult.fallback),
          generated: Boolean(imageResult.generated),
          reason: imageResult.reason,
          reused: Boolean(imageResult.reused),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    await connection.rollback()
    console.error('Generate article error:', error)
    return Response.json({ error: 'Failed to generate article' }, { status: 500 })
  } finally {
    connection.release()
  }
}
