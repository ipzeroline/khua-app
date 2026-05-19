import { NextRequest } from 'next/server'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

interface MemberRow extends RowDataPacket {
  id: number
  email: string
  name: string
  phone: string | null
  role: string
  status: string
  points_balance: number
  created_at: string
  updated_at: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_MEMBERS)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute<MemberRow[]>(
      'SELECT id, email, name, phone, role, status, points_balance, created_at, updated_at FROM users WHERE id = ?',
      [id],
    )
    if (rows.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(rows[0])
  } finally {
    connection.release()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_MEMBERS)
  if (auth instanceof Response) return auth

  const { id } = await params
  const { email, name, phone, role, status, points_balance } = await request.json()

  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : undefined
  if (normalizedEmail === '') {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const normalizedPoints =
    points_balance === undefined || points_balance === null || points_balance === ''
      ? undefined
      : Number(points_balance)

  if (normalizedPoints !== undefined && (!Number.isInteger(normalizedPoints) || normalizedPoints < 0)) {
    return Response.json({ error: 'Points must be a positive integer' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE users
       SET email = COALESCE(?, email),
           name = COALESCE(?, name),
           phone = ?,
           role = COALESCE(?, role),
           status = COALESCE(?, status),
           points_balance = COALESCE(?, points_balance)
       WHERE id = ?`,
      [
        normalizedEmail,
        name || undefined,
        phone || null,
        role || undefined,
        status || undefined,
        normalizedPoints,
        id,
      ],
    )

    if (result.affectedRows === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
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
  const auth = await requirePermission(PERMISSIONS.MANAGE_MEMBERS)
  if (auth instanceof Response) return auth

  const { id } = await params
  const connection = await pool.getConnection()
  try {
    await connection.execute(
      "UPDATE users SET status = 'inactive' WHERE id = ?",
      [id],
    )
    await connection.execute('DELETE FROM sessions WHERE user_id = ?', [id])
    return Response.json({ success: true })
  } finally {
    connection.release()
  }
}
