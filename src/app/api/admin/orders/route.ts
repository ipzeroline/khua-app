import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_PRODUCTS)
  if (auth instanceof Response) return auth

  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search') || ''

  const connection = await pool.getConnection()
  try {
    const where: string[] = []
    const params: any[] = []

    if (userId) {
      where.push('o.user_id = ?')
      params.push(userId)
    }

    if (status) {
      where.push('o.status = ?')
      params.push(status)
    }

    if (search) {
      where.push('(o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [orders] = await connection.execute(
      `SELECT o.id, o.order_number, o.user_id, o.status, o.subtotal, o.shipping_fee,
              o.total, o.currency, o.payment_status, o.payment_slip_url,
              o.shipping_carrier, o.tracking_number, o.points_awarded,
              o.points_awarded_at, o.created_at, u.name as customer_name,
              u.email as customer_email
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY o.created_at DESC
       LIMIT 100`,
      params,
    )

    const rows = orders as any[]
    if (rows.length === 0) return Response.json({ orders: [] })

    const ids = rows.map((order) => order.id)
    const placeholders = ids.map(() => '?').join(',')
    const [items] = await connection.execute(
      `SELECT order_id, product_name, unit_price, quantity, line_total
       FROM order_items
       WHERE order_id IN (${placeholders})
       ORDER BY id ASC`,
      ids,
    )
    const itemRows = items as any[]

    return Response.json({
      orders: rows.map((order) => ({
        ...order,
        items: itemRows.filter((item) => Number(item.order_id) === Number(order.id)),
      })),
    })
  } finally {
    connection.release()
  }
}
