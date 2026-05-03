import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

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

  if (pathname.startsWith('/portal')) {
    const token = request.cookies.get('guest-session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const payload = await verifyJwt(token)
    if (!payload || payload.type !== 'guest' || !payload.checkOut) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('guest-session')
      return response
    }
    // Force-expire when reservation's checkout day has passed
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkOut = new Date(payload.checkOut as string)
    checkOut.setHours(0, 0, 0, 0)
    if (checkOut < today) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('guest-session')
      return response
    }
  }

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('admin-session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const payload = await verifyJwt(token)
    if (!payload || payload.type === 'guest') {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('admin-session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/dashboard/:path*'],
}
