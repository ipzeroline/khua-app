import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.MANAGE_STAFF)
  if (auth instanceof Response) return auth

  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      `SELECT u.id, u.email, u.name, u.phone, u.role, u.status, u.created_at,
              GROUP_CONCAT(sp.permission) as permissions
       FROM users u
       LEFT JOIN staff_permissions sp ON sp.user_id = u.id
       WHERE u.role IN ('staff', 'admin')
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
    )

    return Response.json({
      staff: (rows as any[]).map((r: any) => ({
        ...r,
        permissions: r.permissions ? r.permissions.split(',') : [],
      })),
    })
  } finally {
    connection.release()
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_STAFF)
  if (auth instanceof Response) return auth

  const { email, password, name, phone, permissions } = await request.json()

  if (!email || !password || !name) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email.toLowerCase().trim(), passwordHash, name, phone || null, 'staff'],
    )

    const userId = (result as any).insertId

    if (permissions && Array.isArray(permissions)) {
      for (const perm of permissions) {
        await connection.execute(
          'INSERT INTO staff_permissions (user_id, permission) VALUES (?, ?)',
          [userId, perm],
        )
      }
    }

    return Response.json(
      { id: userId, email, name, role: 'staff', permissions: permissions || [] },
      { status: 201 },
    )
  } finally {
    connection.release()
  }
}
