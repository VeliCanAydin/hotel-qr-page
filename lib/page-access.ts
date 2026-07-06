import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminRolePages, adminUsers } from '@/lib/db/schema'
import { getAdminPageByHref, isDashboardPathAllowed } from '@/lib/permissions'

export type AdminSessionInfo = {
  userId: number
  roleName: string
}

// Single source of truth for dashboard page access, shared by proxy.ts and
// requireAdmin(). A DB row written via the Access Control UI always wins over
// the static role presets; unknown pages and DB errors deny (fail closed).
export async function isPageAllowedForSession(
  session: AdminSessionInfo,
  pathname: string
): Promise<boolean> {
  if (session.roleName === 'Super Admin') return true

  const page = getAdminPageByHref(pathname)
  if (!page) return false

  try {
    const [user] = await db
      .select({ roleId: adminUsers.roleId })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.userId))
      .limit(1)

    if (user?.roleId) {
      const [row] = await db
        .select({ isAllowed: adminRolePages.isAllowed })
        .from(adminRolePages)
        .where(and(eq(adminRolePages.roleId, user.roleId), eq(adminRolePages.pageKey, page.href)))
        .limit(1)

      if (row) return row.isAllowed
    }

    return isDashboardPathAllowed(page.href, session.roleName)
  } catch {
    return false
  }
}
