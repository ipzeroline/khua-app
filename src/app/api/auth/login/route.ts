import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createToken, createSession, setTokenCookie } from '@/lib/auth'

const QUERY_TIMEOUT_MS = 3000

function isTransientDbError(error: unknown) {
  const code = (error as { code?: string })?.code
  return (
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'ETIMEDOUT'
  )
}

async function findUserByEmail(email: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let connection
    try {
      connection = await pool.getConnection()
      const [rows] = await connection.execute(
        {
          sql: 'SELECT id, email, password_hash, name, role, status FROM users WHERE email = ?',
          timeout: QUERY_TIMEOUT_MS,
        },
        [email],
      )
      return rows as any[]
    } catch (error) {
      if (attempt === 0 && isTransientDbError(error)) continue
      throw error
    } finally {
      connection?.release()
    }
  }

  return []
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const users = await findUserByEmail(email.toLowerCase().trim())
    if (users.length === 0) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = users[0]

    if (user.status !== 'active') {
      return Response.json({ error: 'Account is inactive or suspended' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await createToken({ id: Number(user.id), role: user.role })
    await createSession(Number(user.id), token)
    await setTokenCookie(token)

    return Response.json({
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
