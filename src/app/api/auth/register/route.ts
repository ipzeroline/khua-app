import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createToken, createSession, setTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase().trim()],
      )

      if ((existing as any[]).length > 0) {
        return Response.json({ error: 'Email already registered' }, { status: 409 })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email.toLowerCase().trim(), passwordHash, name, phone || null, 'member'],
      )

      const userId = (result as any).insertId
      const token = await createToken({ id: userId, role: 'member' })
      await createSession(userId, token)
      await setTokenCookie(token)

      return Response.json({
        user: { id: userId, email: email.toLowerCase().trim(), name, role: 'member' },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
