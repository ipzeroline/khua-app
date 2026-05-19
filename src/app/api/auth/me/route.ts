import { getSession } from '@/lib/auth'
import { getUserPermissions } from '@/lib/permissions'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return Response.json({ user: null }, { status: 401 })
    }

    const permissions = await getUserPermissions(user.id)

    return Response.json({ user: { ...user, permissions } })
  } catch (error) {
    console.error('Me error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
