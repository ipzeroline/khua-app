import { NextRequest } from 'next/server'
import type { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

type GeneratedArticle = {
  slug: string
  title: string
  excerpt?: string
  category?: string
  tags?: string[]
  highlights?: string[]
  content?: string[]
}

type ArticleGenerator = {
  generateCoverImage: (
    slug: string,
    article: GeneratedArticle,
    options?: { force?: boolean; variant?: string },
  ) => Promise<{
    coverImageUrl: string
    imagePrompt: string
    fallback?: boolean
    generated?: boolean
    reason?: string
    reused?: boolean
  }>
}

interface ArticleCoverRow extends RowDataPacket {
  slug: string
  title: string | null
  excerpt: string | null
  category: string | null
  tags_json: string | null
  highlights_json: string | null
  content_json: string | null
}

async function loadGenerator(): Promise<ArticleGenerator> {
  return import('../../../../../../../scripts/generate-daily-articles.mjs') as Promise<ArticleGenerator>
}

function parseJsonArray(value: string | null) {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()

  try {
    const [rows] = await connection.execute<ArticleCoverRow[]>(
      `SELECT
         a.slug,
         t.title,
         t.excerpt,
         t.category,
         t.tags_json,
         t.highlights_json,
         t.content_json
       FROM articles a
       LEFT JOIN article_translations t ON t.article_id = a.id AND t.locale = 'th'
       WHERE a.id = ?
       LIMIT 1`,
      [id],
    )
    const article = rows[0]
    if (!article) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const generator = await loadGenerator()
    const variant = Date.now().toString(36)
    const imageResult = await generator.generateCoverImage(
      article.slug,
      {
        slug: article.slug,
        title: article.title || article.slug,
        excerpt: article.excerpt || '',
        category: article.category || '',
        tags: parseJsonArray(article.tags_json),
        highlights: parseJsonArray(article.highlights_json),
        content: parseJsonArray(article.content_json),
      },
      { force: true, variant },
    )
    const { coverImageUrl, imagePrompt } = imageResult

    await connection.execute(
      'UPDATE articles SET cover_image_url = ?, image_prompt = ? WHERE id = ?',
      [coverImageUrl, imagePrompt, id],
    )

    return Response.json({
      cover_image_url: coverImageUrl,
      image_prompt: imagePrompt,
      image: {
        fallback: Boolean(imageResult.fallback),
        generated: Boolean(imageResult.generated),
        reason: imageResult.reason,
        reused: Boolean(imageResult.reused),
      },
    })
  } catch (error) {
    console.error('Regenerate article cover error:', error)
    return Response.json({ error: 'Failed to regenerate cover image' }, { status: 500 })
  } finally {
    connection.release()
  }
}
