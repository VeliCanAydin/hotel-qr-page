"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings2,
  SquareTerminal,
  ShoppingCart,
  HandPlatter,
  Hotel,
  type LucideIcon,
} from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ADMIN_PAGE_PERMISSIONS, getRolePreset } from "@/lib/permissions"

// The menu is generated from ADMIN_PAGE_PERMISSIONS so the sidebar, the
// Access Control UI and proxy.ts share one page list and can never drift.
const SECTION_GROUPS: { section: string; title: string; url: string; icon: LucideIcon }[] = [
  { section: "Content", title: "Content Management", url: "/dashboard/content", icon: SquareTerminal },
  { section: "Services", title: "Services", url: "/dashboard/services", icon: HandPlatter },
  { section: "Operations", title: "Operations", url: "/dashboard/orders", icon: ShoppingCart },
  { section: "Administration", title: "Settings", url: "/dashboard/settings", icon: Settings2 },
]

const teams = [
  {
    name: "Dosinia Luxury Resort",
    logo: Hotel,
    plan: "Main Location",
  },
]

function buildNavMain(allowed: (href: string) => boolean) {
  const dashboard = allowed("/dashboard")
    ? [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }]
    : []

  const groups = SECTION_GROUPS.map((group) => ({
    title: group.title,
    url: group.url,
    icon: group.icon,
    items: ADMIN_PAGE_PERMISSIONS
      .filter((page) => page.section === group.section && allowed(page.href))
      .map((page) => ({ title: page.label, url: page.href })),
  })).filter((group) => group.items.length > 0)

  return [...dashboard, ...groups]
}

export function AppSidebar({
  roleName,
  allowedPageKeys,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  roleName: string
  allowedPageKeys?: string[] | undefined
  user?: { name?: string; email?: string }
}) {
  const navMain = React.useMemo(() => {
    // Prefer the DB snapshot (Access Control UI) when provided; otherwise
    // fall back to the static role presets.
    const effectiveAllowed = allowedPageKeys ? new Set(allowedPageKeys) : undefined
    const preset = getRolePreset(roleName)

    const allowed = (href: string) => {
      if (roleName === "Super Admin") return true
      if (effectiveAllowed) return effectiveAllowed.has(href)
      return preset?.allowedPageKeys.includes(href) ?? false
    }

    return buildNavMain(allowed)
  }, [roleName, allowedPageKeys])

  const navUser = {
    name: user?.name ?? user?.email ?? "Admin",
    email: user?.email ?? "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
