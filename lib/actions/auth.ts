'use server'

import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, signToken, SESSION_COOKIE } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type LoginState = { error: string; redirectTo?: string }

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1)

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'Invalid email or password' }
  }

  const token = await signToken(user.id)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { error: '', redirectTo: '/dashboard' }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}
