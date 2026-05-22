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
  const oldLarbProductPath = `/${pathLocale}/products/nam-prik-larb-nuea`

  if (isValidLocale(pathLocale) && pathname === oldLarbProductPath) {
    const newUrl = new URL(`/${pathLocale}/products/nam-prik-larb-phayao`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 308)
  }

  const oldTaDaengProductPath = `/${pathLocale}/products/nam-prik-ta-daeng`

  if (isValidLocale(pathLocale) && pathname === oldTaDaengProductPath) {
    const newUrl = new URL(`/${pathLocale}/products/nam-prik-ta-daeng-phayao`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 308)
  }

  const oldTaDaengMangDaProductPath = `/${pathLocale}/products/nam-prik-ta-daeng-mang-da`

  if (isValidLocale(pathLocale) && pathname === oldTaDaengMangDaProductPath) {
    const newUrl = new URL(`/${pathLocale}/products/nam-prik-ta-daeng-mang-da-phayao`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 308)
  }

  const oldKaengNueaProductPath = `/${pathLocale}/products/nam-prik-kaeng-nuea`

  if (isValidLocale(pathLocale) && pathname === oldKaengNueaProductPath) {
    const newUrl = new URL(`/${pathLocale}/products/nam-prik-kaeng-nuea-phayao`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 308)
  }

  const oldNamNgiaoProductPath = `/${pathLocale}/products/nam-prik-nam-ngiao-nuea`

  if (isValidLocale(pathLocale) && pathname === oldNamNgiaoProductPath) {
    const newUrl = new URL(`/${pathLocale}/products/nam-prik-nam-ngiao-phayao`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 308)
  }

  const oldLannaSetProductPath = `/${pathLocale}/products/khua-lanna-set-5`

  if (isValidLocale(pathLocale) && pathname === oldLannaSetProductPath) {
    const newUrl = new URL(`/${pathLocale}/products/khua-lanna-set-5-phayao`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 308)
  }

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
