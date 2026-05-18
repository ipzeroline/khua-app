import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE, isValidLocale } from '@/i18n'

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
