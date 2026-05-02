"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  content: "Content",
  "hotel-info": "Hotel Info",
  restaurants: "Restaurants",
  spa: "Spa",
  "beach-pools": "Beach & Pools",
  events: "Events",
  list: "List",
  services: "Services",
  "room-service": "Room Service",
  restaurant: "Restaurant",
  "kids-care": "Kids Care",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => {
          const label = LABELS[seg] ?? seg
          const isLast = i === segments.length - 1
          const href = "/" + segments.slice(0, i + 1).join("/")
          return (
            <React.Fragment key={href}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
