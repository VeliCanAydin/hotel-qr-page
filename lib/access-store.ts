'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminRolePages, adminRoles, adminUsers } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth'
import { DEFAULT_ADMIN_ROLE_PRESETS, type AdminPagePermission } from '@/lib/permissions'
import {
  ADMIN_PAGE_PERMISSIONS,
} from '@/lib/permissions'

export type AccessControlRole = {
  id: number
  name: string
  description: string
  isSystem: boolean
  staffCount: number
  allowedCount: number
  permissions: Record<string, boolean>
}

export type AccessControlStaffMember = {
  id: number
  email: string
  roleId: number | null
  roleName: string | null
  roleDescription: string | null
}

export type AccessControlSnapshot = {
  roles: AccessControlRole[]
  staff: AccessControlStaffMember[]
  pages: AdminPagePermission[]
  isReadOnly: boolean
  warning?: string
}

function buildFallbackSnapshot(message: string): AccessControlSnapshot {
  const pages = ADMIN_PAGE_PERMISSIONS
  const roles = DEFAULT_ADMIN_ROLE_PRESETS.map((preset, index) => {
    const permissions = Object.fromEntries(
      pages.map((page) => [page.href, preset.allowedPageKeys.includes(page.href)])
    )

    return {
      id: index + 1,
      name: preset.name,
      description: preset.description,
      isSystem: preset.isSystem,
      staffCount: 0,
      allowedCount: Object.values(permissions).filter(Boolean).length,
      permissions,
    }
  })

  return {
    roles,
    staff: [],
    pages,
    isReadOnly: true,
    warning: message,
  }
}

export async function getAccessControlSnapshot(): Promise<AccessControlSnapshot> {
  // Any authenticated staff member may read (the admin layout builds the
  // sidebar from it); only Access Control page holders may mutate below.
  await requireAdmin()

  try {
    const roles = await db.select().from(adminRoles)
    const rolePermissions = await db.select().from(adminRolePages)
    const staffMembers = await db.select().from(adminUsers)

    if (roles.length === 0 && staffMembers.length === 0) {
      return buildFallbackSnapshot(
        'RBAC tables are empty. Seed the default roles and staff accounts to enable editing.'
      )
    }

    const pages = ADMIN_PAGE_PERMISSIONS
    // Explicit DB rows win; pages a role has no row for fall back to the
    // static preset — the same resolution order as isPageAllowedForSession.
    const explicitByRole = new Map<number, Map<string, boolean>>()
    for (const row of rolePermissions) {
      if (!explicitByRole.has(row.roleId)) {
        explicitByRole.set(row.roleId, new Map())
      }
      explicitByRole.get(row.roleId)!.set(row.pageKey, row.isAllowed)
    }

    const staffCountByRole = new Map<number, number>()
    for (const staff of staffMembers) {
      if (staff.roleId != null) {
        staffCountByRole.set(staff.roleId, (staffCountByRole.get(staff.roleId) ?? 0) + 1)
      }
    }

    return {
      roles: roles.map((role) => {
        const explicit = explicitByRole.get(role.id)
        const preset = DEFAULT_ADMIN_ROLE_PRESETS.find((candidate) => candidate.name === role.name)
        const permissions = Object.fromEntries(
          pages.map((page) => {
            const explicitAllowed = explicit?.get(page.href)
            const fallbackAllowed =
              role.name === 'Super Admin' || (preset?.allowedPageKeys.includes(page.href) ?? false)
            return [page.href, explicitAllowed ?? fallbackAllowed]
          })
        )

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          staffCount: staffCountByRole.get(role.id) ?? 0,
          allowedCount: Object.values(permissions).filter(Boolean).length,
          permissions,
        }
      }),
      staff: staffMembers.map((member) => ({
        id: member.id,
        email: member.email,
        roleId: member.roleId,
        roleName: roles.find((role) => role.id === member.roleId)?.name ?? null,
        roleDescription: roles.find((role) => role.id === member.roleId)?.description ?? null,
      })),
      pages,
      isReadOnly: false,
    }
  } catch {
    return buildFallbackSnapshot(
      'Temporary mode is active. Access rules and test accounts are hardcoded until the DB integration is added.'
    )
  }
}

export async function updateRoleAccess(roleId: number, pageKey: string, isAllowed: boolean) {
  await requireAdmin('/dashboard/settings/access-control')

  const [role] = await db.select().from(adminRoles).where(eq(adminRoles.id, roleId)).limit(1)
  if (!role) {
    throw new Error('Role not found')
  }

  const [existing] = await db
    .select()
    .from(adminRolePages)
    .where(and(eq(adminRolePages.roleId, roleId), eq(adminRolePages.pageKey, pageKey)))
    .limit(1)

  if (existing) {
    await db
      .update(adminRolePages)
      .set({ isAllowed })
      .where(eq(adminRolePages.id, existing.id))
    return
  }

  await db.insert(adminRolePages).values({
    roleId,
    pageKey,
    isAllowed,
  })
}

export async function updateStaffRole(userId: number, roleId: number | null) {
  const session = await requireAdmin('/dashboard/settings/access-control')
  if (session.userId === userId) {
    throw new Error('You cannot change your own role')
  }

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1)
  if (!user) {
    throw new Error('User not found')
  }

  await db.update(adminUsers).set({ roleId }).where(eq(adminUsers.id, userId))
}