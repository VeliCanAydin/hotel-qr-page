import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { getTempAdminUserByEmail } from '@/lib/permissions'

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

export async function verifyTempAdminCredentials(email: string, password: string) {
  const tempUser = getTempAdminUserByEmail(email)
  if (!tempUser || tempUser.password !== password) {
    return null
  }

  return tempUser
}
