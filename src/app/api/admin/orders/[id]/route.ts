import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

const SUCCESS_STATUSES = new Set(['completed', 'success'])

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_PRODUCTS)
  if (auth instanceof Response) return auth

  const { id } = await params
  const { status, shipping_carrier, tracking_number } = await request.json()
  const normalizedStatus = status === 'success' ? 'completed' : status

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [currentRows] = await connection.execute(
      `SELECT id, user_id, total, points_awarded_at
       FROM orders
       WHERE id = ?
       FOR UPDATE`,
      [id],
    )
    const current = (currentRows as any[])[0]
    if (!current) {
      await connection.rollback()
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    await connection.execute(
      `UPDATE orders
       SET status = COALESCE(?, status),
           shipping_carrier = ?,
           tracking_number = ?
       WHERE id = ?`,
      [
        normalizedStatus || null,
        shipping_carrier ? String(shipping_carrier).trim() : null,
        tracking_number ? String(tracking_number).trim() : null,
        id,
      ],
    )

    let awardedPoints = 0
    if (normalizedStatus && SUCCESS_STATUSES.has(normalizedStatus) && !current.points_awarded_at) {
      awardedPoints = Math.floor(Number(current.total) / 100)
      if (awardedPoints > 0) {
        await connection.execute(
          `UPDATE users
           SET points_balance = points_balance + ?
           WHERE id = ?`,
          [awardedPoints, current.user_id],
        )
        await connection.execute(
          `INSERT INTO loyalty_transactions (user_id, order_id, points, type, description)
           VALUES (?, ?, ?, 'earn', ?)`,
          [current.user_id, id, awardedPoints, `Earned from order ${id}`],
        )
        await connection.execute(
          `UPDATE orders
           SET points_awarded = ?, points_awarded_at = NOW()
           WHERE id = ?`,
          [awardedPoints, id],
        )
      }
    }

    await connection.commit()
    return Response.json({ success: true, awarded_points: awardedPoints })
  } catch (error) {
    await connection.rollback()
    console.error('Update admin order error:', error)
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  } finally {
    connection.release()
  }
}
