import { getSession, SessionUser } from '@/lib/auth'
import { hasPermission, Permission } from '@/lib/permissions'

export interface AuthContext {
  user: SessionUser
}

function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

function forbiddenResponse() {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

export async function requireAuth(): Promise<AuthContext | Response> {
  const user = await getSession()
  if (!user) return unauthorizedResponse()
  return { user }
}

export async function requirePermission(
  permission: Permission,
): Promise<AuthContext | Response> {
  const user = await getSession()
  if (!user) return unauthorizedResponse()

  const ok = await hasPermission(user, permission)
  if (!ok) return forbiddenResponse()

  return { user }
}
