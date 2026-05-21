import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission, AuthContext } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

type DbParam = string | number | null

interface CountRow extends RowDataPacket {
  total: number
}

interface CategoryRow extends RowDataPacket {
  category: string
}

export async function GET(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit
  const status = url.searchParams.get('status') || ''
  const category = url.searchParams.get('category') || ''
  const locale = url.searchParams.get('locale') || 'th'

  const connection = await pool.getConnection()
  try {
    let query = `
      SELECT a.id, a.slug, a.status, a.cover_image_url, a.published_at, a.author_id,
             a.created_at, a.updated_at,
             u.name as author_name,
             t.category
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN article_translations t ON t.article_id = a.id AND t.locale = ?
      WHERE 1=1`
    const params: DbParam[] = [locale]

    if (status) {
      query += ' AND a.status = ?'
      params.push(status)
    }

    if (category) {
      query += ' AND t.category = ?'
      params.push(category)
    }

    query += ' ORDER BY a.updated_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const [rows] = await connection.execute(query, params)

    let countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      LEFT JOIN article_translations t ON t.article_id = a.id AND t.locale = ?
      WHERE 1=1`
    const countParams: DbParam[] = [locale]

    if (status) {
      countQuery += ' AND a.status = ?'
      countParams.push(status)
    }

    if (category) {
      countQuery += ' AND t.category = ?'
      countParams.push(category)
    }

    const [countResult] = await connection.execute<CountRow[]>(
      countQuery,
      countParams,
    )

    const [categoryRows] = await connection.execute<CategoryRow[]>(
      `
        SELECT DISTINCT t.category
        FROM article_translations t
        INNER JOIN articles a ON a.id = t.article_id
        WHERE t.locale = ? AND t.category <> ''
        ORDER BY t.category ASC
      `,
      [locale],
    )

    return Response.json({
      articles: rows,
      total: countResult[0]?.total ?? 0,
      page,
      limit,
      categories: categoryRows.map((row) => row.category),
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

    const [result] = await connection.execute<ResultSetHeader>(
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

    const articleId = result.insertId

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
