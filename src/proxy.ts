import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_LOCALE = 'th'
const LOCALES = ['th', 'en', 'lo', 'zh'] as const

function isValidLocale(locale: string): locale is (typeof LOCALES)[number] {
  return LOCALES.includes(locale as (typeof LOCALES)[number])
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|html)$/)
  ) {
    return NextResponse.next()
  }

  const pathLocale = pathname.split('/')[1]

  // Redirect /admin to /{locale}/admin/login if not already on a localized path
  if (pathname.startsWith('/admin')) {
    const hasToken = request.cookies.get('khua_token')?.value
    if (!hasToken) {
      const loginUrl = new URL(`/${DEFAULT_LOCALE}/admin/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }
    const localizedUrl = new URL(
      `/${DEFAULT_LOCALE}${pathname}`,
      request.url,
    )
    localizedUrl.search = request.nextUrl.search
    return NextResponse.redirect(localizedUrl)
  }

  if (!isValidLocale(pathLocale)) {
    const newUrl = new URL(
      `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`,
      request.url,
    )
    newUrl.search = request.nextUrl.search

    const response = NextResponse.redirect(newUrl)
    response.cookies.set('NEXT_LOCALE', DEFAULT_LOCALE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  }

  // Protect admin routes — redirect to login if no token
  if (pathname.split('/')[2] === 'admin' && pathname.split('/')[3] !== 'login') {
    const hasToken = request.cookies.get('khua_token')?.value
    if (!hasToken) {
      const loginUrl = new URL(
        `/${pathLocale}/admin/login`,
        request.url,
      )
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()
  response.cookies.set('NEXT_LOCALE', pathLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

export const config = {
  matcher: ['/((?!_next|api|images|favicon|.*\\..*).*)'],
}
