import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'khua-jwt-secret-change-in-production',
)

const TOKEN_COOKIE = 'khua_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const QUERY_TIMEOUT_MS = 3000

export interface SessionUser {
  id: number
  email: string
  name: string
  role: 'member' | 'staff' | 'admin'
}

function isTransientDbError(error: unknown) {
  const code = (error as { code?: string })?.code
  return (
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'ETIMEDOUT'
  )
}

export async function createToken(user: { id: number; role: string }): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { sub: payload.sub as string, role: payload.role as string }
  } catch {
    return null
  }
}

export async function createSession(userId: number, token: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let connection
    try {
      connection = await pool.getConnection()
      await connection.execute(
        {
          sql: 'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
          timeout: QUERY_TIMEOUT_MS,
        },
        [userId, token],
      )
      return
    } catch (error) {
      if (attempt === 0 && isTransientDbError(error)) continue
      throw error
    } finally {
      connection?.release()
    }
  }
}

export async function destroySession(token: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let connection
    try {
      connection = await pool.getConnection()
      await connection.execute(
        { sql: 'DELETE FROM sessions WHERE token = ?', timeout: QUERY_TIMEOUT_MS },
        [token],
      )
      return
    } catch (error) {
      if (attempt === 0 && isTransientDbError(error)) continue
      throw error
    } finally {
      connection?.release()
    }
  }
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  })
}

export async function clearTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE)
  cookieStore.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await getTokenFromCookies()
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let connection
    try {
      connection = await pool.getConnection()
      const [rows] = await connection.execute(
        {
          sql: `SELECT u.id, u.email, u.name, u.role, u.status
               FROM users u
               INNER JOIN sessions s ON s.user_id = u.id
               WHERE s.token = ? AND s.expires_at > NOW() AND u.status = 'active'`,
          timeout: QUERY_TIMEOUT_MS,
        },
        [token],
      )
      const users = rows as any[]
      if (users.length === 0) return null
      const u = users[0]
      return { id: Number(u.id), email: u.email, name: u.name, role: u.role }
    } catch (error) {
      if (attempt === 0 && isTransientDbError(error)) continue
      throw error
    } finally {
      connection?.release()
    }
  }

  return null
}
