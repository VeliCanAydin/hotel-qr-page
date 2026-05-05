"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function isPathActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      disabled?: boolean
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }

      for (const item of items) {
        const groupIsActive =
          isPathActive(pathname, item.url) ||
          item.items?.some((subItem) => !subItem.disabled && isPathActive(pathname, subItem.url))

        if (groupIsActive) {
          next[item.title] = true
        }
      }

      return next
    })
  }, [items, pathname])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const groupIsActive =
            isPathActive(pathname, item.url) ||
            item.items?.some((subItem) => !subItem.disabled && isPathActive(pathname, subItem.url))

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openGroups[item.title] ?? groupIsActive ?? item.isActive ?? false}
              onOpenChange={(open) =>
                setOpenGroups((prev) => ({
                  ...prev,
                  [item.title]: open,
                }))
              }
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={groupIsActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const subItemIsActive = !subItem.disabled && isPathActive(pathname, subItem.url)

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.disabled ? (
                            <SidebarMenuSubButton
                              aria-disabled="true"
                              tabIndex={-1}
                              className="cursor-not-allowed opacity-50"
                            >
                              <span>{subItem.title}</span>
                              <span className="ml-auto text-[10px] uppercase tracking-wide">Soon</span>
                            </SidebarMenuSubButton>
                          ) : (
                            <SidebarMenuSubButton asChild isActive={subItemIsActive}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
