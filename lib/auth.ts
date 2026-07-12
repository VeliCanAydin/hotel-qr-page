import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { isPageAllowedForSession } from '@/lib/page-access'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signToken(payload: { userId: number; email: string; roleName: string }): Promise<string> {
  return new SignJWT({ ...payload, type: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string; roleName: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type === 'guest') return null
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      roleName: payload.roleName as string,
    }
  } catch {
    return null
  }
}

export const SESSION_COOKIE = 'admin-session'

export type AdminSession = { userId: number; email: string; roleName: string }

// Guards server actions and API routes. Every admin mutation must call this —
// proxy.ts only protects page navigation, not action/route invocations.
// Pass the owning dashboard page href to also enforce role page permissions.
export async function requireAdmin(pageHref?: string): Promise<AdminSession> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifyToken(token) : null

  if (!session || !session.userId) {
    throw new Error('Unauthorized: admin session required')
  }

  if (pageHref && !(await isPageAllowedForSession(session, pageHref))) {
    throw new Error('Forbidden: your role has no access to this page')
  }

  return session
}

// --- Guest auth ---

export const GUEST_SESSION_COOKIE = 'guest-session'

export interface GuestTokenPayload {
  roomNumber: string
  surname: string
  reservationCode: string  // unique per stay — prevents room reuse ambiguity
  checkOut: string         // ISO date, checked in proxy to force-expire on stay end
}

export async function signGuestToken(payload: GuestTokenPayload): Promise<string> {
  return new SignJWT({ ...payload, type: 'guest' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyGuestToken(token: string): Promise<GuestTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type !== 'guest') return null
    if (!payload.reservationCode || !payload.checkOut) return null
    return {
      roomNumber: payload.roomNumber as string,
      surname: payload.surname as string,
      reservationCode: payload.reservationCode as string,
      checkOut: payload.checkOut as string,
    }
  } catch {
    return null
  }
}

export async function verifySession(): Promise<{ role: 'guest' | 'staff'; roomNumber?: string; email?: string } | null> {
  const cookieStore = await cookies()

  // 1. Check admin/staff session
  const adminToken = cookieStore.get(SESSION_COOKIE)?.value
  if (adminToken) {
    const payload = await verifyToken(adminToken)
    if (payload) {
      return { role: 'staff', email: payload.email }
    }
  }

  // 2. Check guest session
  const guestToken = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (guestToken) {
    const payload = await verifyGuestToken(guestToken)
    if (payload) {
      // Force-expire when checkout day has passed
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const checkOut = new Date(payload.checkOut)
      checkOut.setHours(0, 0, 0, 0)
      if (checkOut >= today) {
        // Also verify in DB using dynamic import to avoid circular dependency
        const { findActiveReservation } = await import('@/lib/reservations')
        const activeRes = await findActiveReservation(payload.reservationCode)
        if (activeRes) {
          return { role: 'guest', roomNumber: payload.roomNumber }
        }
      }
    }
  }

  return null
}

