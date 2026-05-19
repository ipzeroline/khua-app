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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { id } = await params
  const address = normalizeAddress(await request.json())
  if (!validateAddress(address)) {
    return Response.json({ error: 'Missing required address fields' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    if (address.is_default) {
      await connection.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [
        auth.user.id,
      ])
    }

    const [result] = await connection.execute(
      `UPDATE user_addresses
       SET recipient_name = ?,
           phone = ?,
           address_line1 = ?,
           address_line2 = ?,
           subdistrict = ?,
           district = ?,
           province = ?,
           postal_code = ?,
           country = ?,
           is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        address.recipient_name,
        address.phone,
        address.address_line1,
        address.address_line2,
        address.subdistrict,
        address.district,
        address.province,
        address.postal_code,
        address.country,
        address.is_default ? 1 : 0,
        id,
        auth.user.id,
      ],
    )

    if ((result as any).affectedRows === 0) {
      await connection.rollback()
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await connection.commit()
    return Response.json({ success: true })
  } catch (error) {
    await connection.rollback()
    console.error('Update address error:', error)
    return Response.json({ error: 'Failed to update address' }, { status: 500 })
  } finally {
    connection.release()
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute(
      'SELECT is_default FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, auth.user.id],
    )
    const addresses = rows as any[]
    if (addresses.length === 0) {
      await connection.rollback()
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await connection.execute('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [
      id,
      auth.user.id,
    ])

    if (Number(addresses[0].is_default) === 1) {
      await connection.execute(
        `UPDATE user_addresses
         SET is_default = 1
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT 1`,
        [auth.user.id],
      )
    }

    await connection.commit()
    return Response.json({ success: true })
  } catch (error) {
    await connection.rollback()
    console.error('Delete address error:', error)
    return Response.json({ error: 'Failed to delete address' }, { status: 500 })
  } finally {
    connection.release()
  }
}
