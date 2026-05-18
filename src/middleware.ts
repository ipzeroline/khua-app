import { NextRequest, NextResponse } from 'next/server'
import { isValidLocale, DEFAULT_LOCALE } from '@/i18n'

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname
  const pathLocale = pathname.split('/')[1]
  if (isValidLocale(pathLocale)) return pathLocale

  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && isValidLocale(cookie)) return cookie

  const acceptLanguage = request.headers.get('accept-language') || ''
  for (const lang of acceptLanguage.split(',')) {
    const code = lang.split(';')[0].trim().substring(0, 2)
    if (code === 'th') return 'th'
    if (code === 'lo') return 'lo'
    if (code === 'en') return 'en'
    if (code === 'zh') return 'zh'
  }

  return DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json)$/)
  ) {
    return NextResponse.next()
  }

  const pathLocale = pathname.split('/')[1]
  const isValid = isValidLocale(pathLocale)

  if (!isValid) {
    const locale = getLocale(request)
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    newUrl.search = request.nextUrl.search

    const response = NextResponse.redirect(newUrl)
    response.cookies.set('NEXT_LOCALE', locale, {
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
