"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  services: "Services",
  "room-service": "Room Service",
  restaurant: "Restaurant",
  content: "Content",
  "hotel-info": "Hotel Info",
  "kids-care": "Kids Care",
  spa: "Spa",
  "beach-pools": "Beach & Pools",
  wellness: "Wellness",
  events: "Events",
  list: "List Events",
  create: "Create Event",
  orders: "Orders",
  guests: "Guests",
  ai: "AI Assistant",
  settings: "Settings",
  "access-control": "Access Control",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const label = LABELS[segment] ?? segment
          const isLast = index === segments.length - 1
          const isFirst = index === 0

          return (
            <Fragment key={href}>
              {!isFirst && <BreadcrumbSeparator key={`sep-${href}`} className="hidden md:block" />}
              <BreadcrumbItem
                key={href}
                className={!isFirst ? "hidden md:block" : ""}
              >
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
