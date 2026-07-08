import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import createIntlMiddleware from 'next-intl/middleware'
import { isPageAllowedForSession } from '@/lib/page-access'
import { routing, LOCALES } from '@/i18n/routing'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

const intlMiddleware = createIntlMiddleware(routing)

// Built from LOCALES so adding a language never breaks the strip (tuzak §2.4).
const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`)

async function verifyJwt(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin is locale-less — handle it before next-intl so the intl middleware
  // never tries to prefix /dashboard with a locale.
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('admin-session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const payload = await verifyJwt(token)
    if (!payload || payload.type !== 'admin' || typeof payload.userId !== 'number' || !payload.userId) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('admin-session')
      return response
    }

    const session = {
      userId: payload.userId,
      roleName: (payload.roleName as string | undefined) ?? '',
    }

    // /dashboard itself stays reachable for every authenticated staff member
    // (it degrades to an empty state) so denied pages have somewhere to land.
    if (pathname !== '/dashboard' && !(await isPageAllowedForSession(session, pathname))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  // API routes are excluded by the matcher, but guard here too for safety.
  if (pathname.startsWith('/api')) return NextResponse.next()

  // Guest surfaces: let next-intl resolve/redirect the locale first (this also
  // turns bare "/" and "/login" into "/{locale}/...").
  const response = intlMiddleware(request)

  // Portal protection runs on the already-localized path. If next-intl is
  // redirecting to add a locale prefix, return that redirect and let auth run
  // on the localized URL next time.
  const locale = pathname.match(LOCALE_PREFIX)?.[1] ?? routing.defaultLocale
  const pathnameWithoutLocale = pathname.replace(LOCALE_PREFIX, '') || '/'

  if (pathnameWithoutLocale.startsWith('/portal')) {
    const token = request.cookies.get('guest-session')?.value
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
    const payload = await verifyJwt(token)
    if (!payload || payload.type !== 'guest' || !payload.checkOut) {
      const res = NextResponse.redirect(new URL(`/${locale}/login`, request.url))
      res.cookies.delete('guest-session')
      return res
    }
    // Force-expire when the reservation's checkout day has passed.
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkOut = new Date(payload.checkOut as string)
    checkOut.setHours(0, 0, 0, 0)
    if (checkOut < today) {
      const res = NextResponse.redirect(new URL(`/${locale}/login`, request.url))
      res.cookies.delete('guest-session')
      return res
    }
  }

  return response
}

export const config = {
  // next-intl needs to see every guest page; exclude api, Next internals and
  // any path with a file extension (static assets, manifest, sw.js, …).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
