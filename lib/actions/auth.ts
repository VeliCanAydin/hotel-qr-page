'use server'

import { eq } from 'drizzle-orm'
import { signToken, SESSION_COOKIE, verifyPassword, verifyTempAdminCredentials } from '@/lib/auth'
import { db } from '@/lib/db'
import { adminRoles, adminUsers } from '@/lib/db/schema'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type LoginState = { error: string; redirectTo?: string }

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const [dbUser] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      passwordHash: adminUsers.passwordHash,
      roleId: adminUsers.roleId,
      roleName: adminRoles.name,
    })
    .from(adminUsers)
    .leftJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
    .where(eq(adminUsers.email, email))
    .limit(1)

  if (dbUser) {
    const isDbUserValid = await verifyPassword(password, dbUser.passwordHash)
    if (!isDbUserValid) {
      return { error: 'Invalid email or password' }
    }

    const token = await signToken({
      userId: dbUser.id,
      email: dbUser.email,
      roleName: dbUser.roleName ?? 'Unassigned',
    })
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

  const tempUser = await verifyTempAdminCredentials(email, password)
  if (!tempUser) {
    return { error: 'Invalid email or password' }
  }

  const token = await signToken({
    userId: 0,
    email: tempUser.email,
    roleName: tempUser.roleName,
  })
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
