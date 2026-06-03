import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { isDashboardPathAllowed } from '@/lib/permissions'
import { db } from '@/lib/db'
import { adminUsers, adminRolePages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

    const roleName = payload.roleName as string | undefined

    // If Super Admin, allow everything
    if (roleName === 'Super Admin') return NextResponse.next()

    // Attempt DB-backed permission check (prefer authoritative). If any error occurs, fall back to preset check.
    try {
      const userId = payload.userId as number | undefined
      let allowed = false
      if (typeof userId === 'number') {
        const users = await db.select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1)
        const user = users[0]
        if (user && user.roleId) {
          const rows = await db.select().from(adminRolePages).where(and(eq(adminRolePages.roleId, user.roleId), eq(adminRolePages.pageKey, pathname))).limit(1)
          const row = rows[0]
          if (row && row.isAllowed) allowed = true
        }
      }

      // If DB couldn't confirm allowed, fall back to preset-based check
      if (!allowed) {
        if (!roleName || !isDashboardPathAllowed(pathname, roleName)) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (err) {
      // DB failed — fallback to preset check
      if (roleName && roleName !== 'Super Admin' && !isDashboardPathAllowed(pathname, roleName)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/dashboard/:path*'],
}
