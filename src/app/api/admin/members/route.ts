import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_MEMBERS)
  if (auth instanceof Response) return auth

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit
  const search = url.searchParams.get('search') || ''

  const connection = await pool.getConnection()
  try {
    let query = `
      SELECT u.id, u.email, u.name, u.phone, u.role, u.status, u.points_balance,
             u.created_at, u.updated_at,
             COUNT(o.id) as order_count,
             COALESCE(SUM(o.total), 0) as order_total
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE 1=1`
    const params: any[] = []

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const [rows] = await connection.execute(query, params)

    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM users' + (search ? ' WHERE name LIKE ? OR email LIKE ?' : ''),
      search ? [`%${search}%`, `%${search}%`] : [],
    )

    return Response.json({
      members: rows,
      total: (countResult as any[])[0].total,
      page,
      limit,
    })
  } finally {
    connection.release()
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_MEMBERS)
  if (auth instanceof Response) return auth

  const bcrypt = await import('bcryptjs')
  const { email, password, name, phone, role } = await request.json()

  if (!email || !password || !name) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email.toLowerCase().trim(), passwordHash, name, phone || null, role || 'member'],
    )

    return Response.json(
      { id: (result as any).insertId, email, name, role: role || 'member' },
      { status: 201 },
    )
  } finally {
    connection.release()
  }
}
