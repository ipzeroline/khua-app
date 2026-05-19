import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      `SELECT a.id, a.slug, a.status, a.cover_image_url, a.image_prompt,
              a.published_at, a.author_id, a.meta_title as article_meta_title,
              a.meta_description as article_meta_description,
              a.created_at, a.updated_at,
              u.name as author_name
       FROM articles a
       LEFT JOIN users u ON u.id = a.author_id
       WHERE a.id = ?`,
      [id],
    )
    const articles = rows as any[]
    if (articles.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const [translations] = await connection.execute(
      'SELECT * FROM article_translations WHERE article_id = ?',
      [id],
    )

    return Response.json({
      ...articles[0],
      translations: (translations as any[]).map((t: any) => ({
        ...t,
        tags: typeof t.tags_json === 'string' ? JSON.parse(t.tags_json) : t.tags_json,
        highlights: typeof t.highlights_json === 'string' ? JSON.parse(t.highlights_json) : t.highlights_json,
        content: typeof t.content_json === 'string' ? JSON.parse(t.content_json) : t.content_json,
      })),
    })
  } finally {
    connection.release()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const { id } = await params
  const { slug, status, cover_image_url, image_prompt, published_at, meta_title, meta_description, translations } =
    await request.json()

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    await connection.execute(
      `UPDATE articles
       SET slug = COALESCE(?, slug),
           status = COALESCE(?, status),
           cover_image_url = COALESCE(?, cover_image_url),
           image_prompt = COALESCE(?, image_prompt),
           published_at = COALESCE(?, published_at),
           meta_title = COALESCE(?, meta_title),
           meta_description = COALESCE(?, meta_description)
       WHERE id = ?`,
      [slug, status, cover_image_url, image_prompt, published_at, meta_title, meta_description, id],
    )

    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        await connection.execute(
          `INSERT INTO article_translations
           (article_id, locale, title, excerpt, category, date_label, read_time, tags_json, highlights_json, content_json, meta_title, meta_description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           excerpt = VALUES(excerpt),
           category = VALUES(category),
           date_label = VALUES(date_label),
           read_time = VALUES(read_time),
           tags_json = VALUES(tags_json),
           highlights_json = VALUES(highlights_json),
           content_json = VALUES(content_json),
           meta_title = VALUES(meta_title),
           meta_description = VALUES(meta_description)`,
          [
            id,
            t.locale,
            t.title || '',
            t.excerpt || '',
            t.category || '',
            t.date_label || '',
            t.read_time || '',
            JSON.stringify(t.tags || []),
            JSON.stringify(t.highlights || []),
            JSON.stringify(t.content || []),
            t.meta_title || null,
            t.meta_description || null,
          ],
        )
      }
    }

    await connection.commit()

    return Response.json({ success: true })
  } catch (error) {
    await connection.rollback()
    console.error('Update article error:', error)
    return Response.json({ error: 'Failed to update article' }, { status: 500 })
  } finally {
    connection.release()
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    await connection.execute('DELETE FROM articles WHERE id = ?', [id])
    return Response.json({ success: true })
  } finally {
    connection.release()
  }
}
