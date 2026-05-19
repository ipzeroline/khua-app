import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

function normalizeAddress(body: any) {
  return {
    recipient_name: String(body.recipient_name || '').trim(),
    phone: String(body.phone || '').trim(),
    address_line1: String(body.address_line1 || '').trim(),
    address_line2: body.address_line2 ? String(body.address_line2).trim() : null,
    subdistrict: body.subdistrict ? String(body.subdistrict).trim() : null,
    district: String(body.district || '').trim(),
    province: String(body.province || '').trim(),
    postal_code: String(body.postal_code || '').trim(),
    country: String(body.country || 'Thailand').trim(),
    is_default: Boolean(body.is_default),
  }
}

function validateAddress(address: ReturnType<typeof normalizeAddress>) {
  return Boolean(
    address.recipient_name &&
      address.phone &&
      address.address_line1 &&
      address.district &&
      address.province &&
      address.postal_code,
  )
}

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      `SELECT *
       FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, updated_at DESC`,
      [auth.user.id],
    )

    return Response.json({ addresses: rows })
  } finally {
    connection.release()
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const address = normalizeAddress(await request.json())
  if (!validateAddress(address)) {
    return Response.json({ error: 'Missing required address fields' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?',
      [auth.user.id],
    )
    const shouldDefault = address.is_default || Number((existing as any[])[0].count) === 0

    if (shouldDefault) {
      await connection.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [
        auth.user.id,
      ])
    }

    const [result] = await connection.execute(
      `INSERT INTO user_addresses
       (user_id, recipient_name, phone, address_line1, address_line2, subdistrict, district, province, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auth.user.id,
        address.recipient_name,
        address.phone,
        address.address_line1,
        address.address_line2,
        address.subdistrict,
        address.district,
        address.province,
        address.postal_code,
        address.country,
        shouldDefault ? 1 : 0,
      ],
    )

    await connection.commit()
    return Response.json({ id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    await connection.rollback()
    console.error('Create address error:', error)
    return Response.json({ error: 'Failed to create address' }, { status: 500 })
  } finally {
    connection.release()
  }
}
