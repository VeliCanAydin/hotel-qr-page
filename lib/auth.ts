import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signToken(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { userId: payload.userId as number }
  } catch {
    return null
  }
}

export const SESSION_COOKIE = 'admin-session'
