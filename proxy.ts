import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard routes — let everything else through
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin-session')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const proxyConfig = {
  // Exclude Next.js internals and static files; run on all user-facing routes
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
