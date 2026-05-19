import pool from '@/lib/db'
import { SessionUser } from '@/lib/auth'

export const PERMISSIONS = {
  MANAGE_ARTICLES: 'manage_articles',
  MANAGE_MEMBERS: 'manage_members',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_PRODUCTS: 'manage_products',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export async function hasPermission(user: SessionUser, permission: Permission): Promise<boolean> {
  if (user.role === 'admin') return true

  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      'SELECT 1 FROM staff_permissions WHERE user_id = ? AND permission = ?',
      [user.id, permission],
    )
    return (rows as any[]).length > 0
  } finally {
    connection.release()
  }
}

export async function getUserPermissions(userId: number): Promise<string[]> {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      'SELECT permission FROM staff_permissions WHERE user_id = ?',
      [userId],
    )
    return (rows as any[]).map((r: any) => r.permission)
  } finally {
    connection.release()
  }
}
