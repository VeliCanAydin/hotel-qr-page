import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminRolePages, adminUsers } from '@/lib/db/schema'
import {
  ADMIN_PAGE_PERMISSIONS,
  getAdminPageByHref,
  getRolePreset,
  isDashboardPathAllowed,
} from '@/lib/permissions'

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

// Bulk variant for pages that filter many links at once (e.g. the dashboard
// cards) — one query instead of one isPageAllowedForSession call per href.
// Same resolution order: explicit DB row > preset; errors deny.
export async function getAllowedPageHrefs(session: AdminSessionInfo): Promise<Set<string>> {
  const allHrefs = ADMIN_PAGE_PERMISSIONS.map((page) => page.href)
  if (session.roleName === 'Super Admin') return new Set(allHrefs)

  try {
    const [user] = await db
      .select({ roleId: adminUsers.roleId })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.userId))
      .limit(1)

    const explicit = new Map<string, boolean>()
    if (user?.roleId) {
      const rows = await db
        .select({ pageKey: adminRolePages.pageKey, isAllowed: adminRolePages.isAllowed })
        .from(adminRolePages)
        .where(eq(adminRolePages.roleId, user.roleId))
      for (const row of rows) explicit.set(row.pageKey, row.isAllowed)
    }

    const preset = getRolePreset(session.roleName)
    return new Set(
      allHrefs.filter(
        (href) => explicit.get(href) ?? preset?.allowedPageKeys.includes(href) ?? false
      )
    )
  } catch {
    return new Set()
  }
}
