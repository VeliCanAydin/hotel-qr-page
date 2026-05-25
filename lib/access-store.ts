'use server'

import { DEFAULT_ADMIN_ROLE_PRESETS, TEMP_ADMIN_USERS, type AdminPagePermission } from '@/lib/permissions'
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
    staff: TEMP_ADMIN_USERS.map((user, index) => ({
      id: index + 1,
      email: user.email,
      roleId: index + 1,
      roleName: user.roleName,
      roleDescription: DEFAULT_ADMIN_ROLE_PRESETS.find((preset) => preset.name === user.roleName)?.description ?? '',
    })),
    pages,
    isReadOnly: true,
    warning: message,
  }
}

export async function getAccessControlSnapshot(): Promise<AccessControlSnapshot> {
  return buildFallbackSnapshot(
    'Temporary mode is active. Access rules and test accounts are hardcoded until the DB integration is added.'
  )
}

export async function updateRoleAccess(roleId: number, pageKey: string, isAllowed: boolean) {
  void roleId
  void pageKey
  void isAllowed
}

export async function updateStaffRole(userId: number, roleId: number | null) {
  void userId
  void roleId
}