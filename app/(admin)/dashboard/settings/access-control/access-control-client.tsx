'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ADMIN_PAGE_PERMISSIONS } from '@/lib/permissions'
import {
  updateRoleAccess,
  updateStaffRole,
  type AccessControlSnapshot,
} from '@/lib/access-store'
import { Lock, ShieldCheck, Users, Sparkles, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

type AccessControlClientProps = {
  initialData: AccessControlSnapshot
}

function groupPagesBySection() {
  const grouped: Record<string, typeof ADMIN_PAGE_PERMISSIONS> = {}

  for (const page of ADMIN_PAGE_PERMISSIONS) {
    grouped[page.section] = grouped[page.section] ?? []
    grouped[page.section].push(page)
  }

  return Object.entries(grouped).map(([section, pages]) => ({ section, pages }))
}

export default function AccessControlClient({ initialData }: AccessControlClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [roles, setRoles] = useState(initialData.roles)
  const [staff, setStaff] = useState(initialData.staff)
  const [selectedRoleId, setSelectedRoleId] = useState(initialData.roles[0]?.id ?? 0)

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0]
  const groupedPages = groupPagesBySection()
  const totalPages = ADMIN_PAGE_PERMISSIONS.length
  const totalStaff = staff.length
  const totalRoles = roles.length
  const restrictedPages = totalPages - (selectedRole?.allowedCount ?? 0)
  const isReadOnly = initialData.isReadOnly

  function updateRoleState(roleId: number, pageKey: string, isAllowed: boolean) {
    setRoles((current) =>
      current.map((role) => {
        if (role.id !== roleId) {
          return role
        }

        const previousAllowed = role.permissions[pageKey]
        const nextPermissions = {
          ...role.permissions,
          [pageKey]: isAllowed,
        }

        return {
          ...role,
          permissions: nextPermissions,
          allowedCount: role.allowedCount + (previousAllowed === isAllowed ? 0 : isAllowed ? 1 : -1),
        }
      })
    )
  }

  function updateStaffState(userId: number, roleId: number | null) {
    setStaff((current) =>
      current.map((member) => (member.id === userId ? { ...member, roleId } : member))
    )
  }

  function changeRoleAccess(roleId: number, pageKey: string, isAllowed: boolean) {
    if (isReadOnly) {
      toast.error('Access control is read-only until the RBAC migration is applied')
      return
    }

    startTransition(async () => {
      try {
        await updateRoleAccess(roleId, pageKey, isAllowed)
        updateRoleState(roleId, pageKey, isAllowed)
        toast.success('Role permissions updated')
      } catch {
        toast.error('Failed to update permissions')
        router.refresh()
      }
    })
  }

  function changeStaffRole(userId: number, nextRoleId: string) {
    const roleId = nextRoleId === 'unassigned' ? null : Number(nextRoleId)
    const previousStaffMember = staff.find((member) => member.id === userId)

    if (previousStaffMember?.roleId === roleId) {
      return
    }

    if (isReadOnly) {
      toast.error('Access control is read-only until the RBAC migration is applied')
      return
    }

    startTransition(async () => {
      try {
        await updateStaffRole(userId, roleId)
        updateStaffState(userId, roleId)
        setRoles((current) =>
          current.map((role) => {
            if (!previousStaffMember) {
              return role
            }

            if (role.id === previousStaffMember.roleId) {
              return { ...role, staffCount: Math.max(0, role.staffCount - 1) }
            }

            if (role.id === roleId) {
              return { ...role, staffCount: role.staffCount + 1 }
            }

            return role
          })
        )
        toast.success('Staff role updated')
      } catch {
        toast.error('Failed to update staff role')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-lg shadow-slate-950/20">
        <CardContent className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_260px] md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin access governance
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Access Control</h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Assign staff roles and decide exactly which dashboard pages they can open. Changes are stored in the database and enforced in the request proxy.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                <Users className="mr-1.5 h-3.5 w-3.5" />
                {totalStaff} staff members
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {totalRoles} roles
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                {totalPages} protected pages
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Selected role coverage</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{selectedRole?.allowedCount ?? 0}/{totalPages}</div>
              <p className="text-xs text-white/60">Pages available for {selectedRole?.name ?? 'the current role'}</p>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Restricted pages</span>
              <span className="font-medium">{restrictedPages}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isReadOnly && (
        <Card className="border-amber-200 bg-amber-50 text-amber-950">
          <CardContent className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">Read-only access control</p>
              <p className="text-sm text-amber-900/80">
                {initialData.warning ?? 'Apply the RBAC migration before changing role permissions.'}
              </p>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-900">
              Migration required
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Staff accounts</CardTitle>
          <CardDescription>
            These accounts are stored in the database and inherit the permissions of their assigned role.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {staff.map((user) => {
            const role = roles.find((item) => item.id === user.roleId)

            return (
              <div key={user.email} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.roleDescription ?? 'No role assigned'}</p>
                  </div>
                  <Badge variant="outline">{user.roleName ?? 'Unassigned'}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Pages:</span> {role?.allowedCount ?? 0}/{ADMIN_PAGE_PERMISSIONS.length}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Role permissions</TabsTrigger>
          <TabsTrigger value="staff">Staff assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Roles</CardTitle>
                <CardDescription>Select a role to edit its page access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map((role) => {
                  const isSelected = role.id === selectedRoleId

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-accent/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium leading-none">{role.name}</p>
                            {role.isSystem && <Badge variant="outline">System</Badge>}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
                        </div>
                        <Badge variant={isSelected ? 'default' : 'secondary'}>{role.allowedCount}/{totalPages}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{role.staffCount} staff member{role.staffCount === 1 ? '' : 's'}</span>
                        <span>Page access</span>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {selectedRole?.name ?? 'Select a role'}
                  </CardTitle>
                  <CardDescription>
                    Toggle the pages this role can access. Dashboard root remains available only when it is explicitly allowed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupedPages.map((group) => (
                    <div key={group.section} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{group.section}</Badge>
                        <Separator className="flex-1" />
                      </div>

                      <div className="space-y-3">
                        {group.pages.map((page) => {
                          const isAllowed = selectedRole?.permissions[page.href] ?? false

                          return (
                            <div key={page.href} className="rounded-xl border p-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">{page.label}</p>
                                    <Badge variant={isAllowed ? 'default' : 'outline'}>
                                      {isAllowed ? 'Allowed' : 'Blocked'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{page.description}</p>
                                  <p className="text-xs text-muted-foreground">{page.href}</p>
                                </div>

                                <Button
                                  type="button"
                                  variant={isAllowed ? 'outline' : 'default'}
                                  size="sm"
                                  onClick={() => selectedRole && changeRoleAccess(selectedRole.id, page.href, !isAllowed)}
                                  disabled={isPending || !selectedRole}
                                >
                                  {isAllowed ? (
                                    <>
                                      <XCircle className="h-3.5 w-3.5" />
                                      Block access
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Allow access
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Staff assignments</CardTitle>
              <CardDescription>Assign a role to every registered staff account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => {
                    const memberRole = roles.find((role) => role.id === member.roleId)

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{member.email}</p>
                            <p className="text-xs text-muted-foreground">Staff user #{member.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={member.roleId ? String(member.roleId) : 'unassigned'}
                            onValueChange={(value) => changeStaffRole(member.id, value)}
                            disabled={isPending}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue placeholder="Assign role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {memberRole ? (
                            <Badge variant="secondary">
                              {memberRole.allowedCount}/{totalPages} pages
                            </Badge>
                          ) : (
                            <Badge variant="outline">No role assigned</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}