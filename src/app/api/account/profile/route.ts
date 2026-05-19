import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      `SELECT id, email, name, phone, role, status, points_balance, created_at
       FROM users
       WHERE id = ?`,
      [auth.user.id],
    )
    const users = rows as any[]
    if (users.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return Response.json({ user: users[0] })
  } finally {
    connection.release()
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { name, phone } = await request.json()

  if (!name || String(name).trim().length < 2) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    await connection.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [String(name).trim(), phone ? String(phone).trim() : null, auth.user.id],
    )

    const [rows] = await connection.execute(
      `SELECT id, email, name, phone, role, status, points_balance, created_at
       FROM users
       WHERE id = ?`,
      [auth.user.id],
    )

    return Response.json({ user: (rows as any[])[0] })
  } finally {
    connection.release()
  }
}
