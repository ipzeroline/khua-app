import { NextRequest } from 'next/server'
import type { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

type GeneratedArticle = {
  slug: string
  title: string
}

type ArticleGenerator = {
  generateCoverImage: (
    slug: string,
    article: GeneratedArticle,
    options?: { force?: boolean; variant?: string },
  ) => Promise<{ coverImageUrl: string; imagePrompt: string }>
}

interface ArticleCoverRow extends RowDataPacket {
  slug: string
  title: string | null
}

async function loadGenerator(): Promise<ArticleGenerator> {
  return import('../../../../../../../scripts/generate-daily-articles.mjs') as Promise<ArticleGenerator>
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
      `SELECT a.slug, t.title
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
    const { coverImageUrl, imagePrompt } = await generator.generateCoverImage(
      article.slug,
      { slug: article.slug, title: article.title || article.slug },
      { force: true, variant },
    )

    await connection.execute(
      'UPDATE articles SET cover_image_url = ?, image_prompt = ? WHERE id = ?',
      [coverImageUrl, imagePrompt, id],
    )

    return Response.json({ cover_image_url: coverImageUrl, image_prompt: imagePrompt })
  } catch (error) {
    console.error('Regenerate article cover error:', error)
    return Response.json({ error: 'Failed to regenerate cover image' }, { status: 500 })
  } finally {
    connection.release()
  }
}
