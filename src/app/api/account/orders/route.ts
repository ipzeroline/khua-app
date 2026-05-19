import pool from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const connection = await pool.getConnection()
  try {
    const [orders] = await connection.execute(
      `SELECT id, order_number, status, subtotal, shipping_fee, total, currency,
              customer_note, shipping_carrier, tracking_number, payment_status,
              payment_slip_url, payment_submitted_at, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [auth.user.id],
    )

    const orderRows = orders as any[]
    if (orderRows.length === 0) {
      return Response.json({ orders: [] })
    }

    const ids = orderRows.map((order) => order.id)
    const placeholders = ids.map(() => '?').join(',')
    const [items] = await connection.execute(
      `SELECT order_id, product_slug, product_name, product_name_en, weight, unit_price, quantity, line_total
       FROM order_items
       WHERE order_id IN (${placeholders})
       ORDER BY id ASC`,
      ids,
    )

    const itemRows = items as any[]
    const ordersWithItems = orderRows.map((order) => ({
      ...order,
      items: itemRows.filter((item) => Number(item.order_id) === Number(order.id)),
    }))

    return Response.json({ orders: ordersWithItems })
  } finally {
    connection.release()
  }
}
