import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_STAFF)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      `SELECT u.id, u.email, u.name, u.phone, u.role, u.status, u.created_at,
              GROUP_CONCAT(sp.permission) as permissions
       FROM users u
       LEFT JOIN staff_permissions sp ON sp.user_id = u.id
       WHERE u.id = ? AND u.role IN ('staff', 'admin')
       GROUP BY u.id`,
      [id],
    )
    const staff = rows as any[]
    if (staff.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({
      ...staff[0],
      permissions: staff[0].permissions ? staff[0].permissions.split(',') : [],
    })
  } finally {
    connection.release()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_STAFF)
  if (auth instanceof Response) return auth

  const { id } = await params
  const { name, phone, status, permissions } = await request.json()

  const connection = await pool.getConnection()
  try {
    await connection.execute(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), status = COALESCE(?, status) WHERE id = ?',
      [name, phone, status, id],
    )

    if (permissions && Array.isArray(permissions)) {
      await connection.execute(
        'DELETE FROM staff_permissions WHERE user_id = ?',
        [id],
      )
      for (const perm of permissions) {
        await connection.execute(
          'INSERT INTO staff_permissions (user_id, permission) VALUES (?, ?)',
          [id, perm],
        )
      }
    }

    return Response.json({ success: true })
  } finally {
    connection.release()
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_STAFF)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    await connection.execute(
      "UPDATE users SET status = 'inactive' WHERE id = ? AND role IN ('staff', 'admin')",
      [id],
    )
    return Response.json({ success: true })
  } finally {
    connection.release()
  }
}
