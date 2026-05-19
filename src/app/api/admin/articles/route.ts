import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission, AuthContext } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit
  const status = url.searchParams.get('status') || ''

  const connection = await pool.getConnection()
  try {
    let query = `
      SELECT a.id, a.slug, a.status, a.cover_image_url, a.published_at, a.author_id,
             a.created_at, a.updated_at,
             u.name as author_name
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ' AND a.status = ?'
      params.push(status)
    }

    query += ' ORDER BY a.updated_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const [rows] = await connection.execute(query, params)

    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM articles' + (status ? ' WHERE status = ?' : ''),
      status ? [status] : [],
    )

    return Response.json({
      articles: rows,
      total: (countResult as any[])[0].total,
      page,
      limit,
    })
  } finally {
    connection.release()
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const ctx = auth as AuthContext
  const { slug, status, cover_image_url, image_prompt, published_at, meta_title, meta_description, translations } =
    await request.json()

  if (!slug) {
    return Response.json({ error: 'Slug is required' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(
      `INSERT INTO articles
       (slug, status, cover_image_url, image_prompt, published_at, author_id, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        status || 'draft',
        cover_image_url || null,
        image_prompt || null,
        published_at || null,
        ctx.user.id,
        meta_title || null,
        meta_description || null,
      ],
    )

    const articleId = (result as any).insertId

    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        await connection.execute(
          `INSERT INTO article_translations
           (article_id, locale, title, excerpt, category, date_label, read_time, tags_json, highlights_json, content_json, meta_title, meta_description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            articleId,
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

    return Response.json({ id: articleId, slug }, { status: 201 })
  } catch (error) {
    await connection.rollback()
    console.error('Create article error:', error)
    return Response.json({ error: 'Failed to create article' }, { status: 500 })
  } finally {
    connection.release()
  }
}
