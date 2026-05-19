import { NextRequest } from 'next/server'
import type { ResultSetHeader } from 'mysql2'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_MEMBERS)
  if (auth instanceof Response) return auth

  const { id } = await params
  const { password } = await request.json()

  if (!password || typeof password !== 'string' || password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id],
    )

    if (result.affectedRows === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await connection.execute('DELETE FROM sessions WHERE user_id = ?', [id])

    return Response.json({ success: true })
  } finally {
    connection.release()
  }
}
