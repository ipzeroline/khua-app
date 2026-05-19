import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import {
  calculateShippingFee,
  createOrderNumber,
  validateCheckoutItems,
} from '@/lib/order-utils'

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { items, address_id, customer_note } = await request.json()

  let validatedItems
  try {
    validatedItems = validateCheckoutItems(items)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Invalid cart' },
      { status: 400 },
    )
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [addressRows] = await connection.execute(
      `SELECT *
       FROM user_addresses
       WHERE id = ? AND user_id = ?`,
      [address_id, auth.user.id],
    )
    const addresses = addressRows as any[]
    if (addresses.length === 0) {
      await connection.rollback()
      return Response.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.line_total, 0)
    const shippingFee = calculateShippingFee(validatedItems)
    const total = subtotal + shippingFee
    const orderNumber = createOrderNumber()

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
       (order_number, user_id, address_id, status, subtotal, shipping_fee, total, currency, customer_note, shipping_snapshot_json)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, 'THB', ?, ?)`,
      [
        orderNumber,
        auth.user.id,
        address_id,
        subtotal,
        shippingFee,
        total,
        customer_note ? String(customer_note).trim() : null,
        JSON.stringify(addresses[0]),
      ],
    )
    const orderId = (orderResult as any).insertId

    for (const item of validatedItems) {
      await connection.execute(
        `INSERT INTO order_items
         (order_id, product_slug, product_name, product_name_en, weight, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_slug,
          item.product_name,
          item.product_name_en,
          item.weight,
          item.unit_price,
          item.quantity,
          item.line_total,
        ],
      )
    }

    await connection.commit()
    return Response.json(
      {
        order: {
          id: orderId,
          order_number: orderNumber,
          status: 'pending',
          subtotal,
          shipping_fee: shippingFee,
          total,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    await connection.rollback()
    console.error('Checkout error:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  } finally {
    connection.release()
  }
}
