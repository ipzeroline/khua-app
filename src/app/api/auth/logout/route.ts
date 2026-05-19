import { getTokenFromCookies, destroySession, clearTokenCookie } from '@/lib/auth'

export async function POST() {
  try {
    const token = await getTokenFromCookies()
    await clearTokenCookie()

    if (token) {
      destroySession(token).catch((error) => {
        console.error('Destroy session error:', error)
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
