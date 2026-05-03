"use client"

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const LABELS: Record<string, string> = {
  portal: 'My Stay',
  reservation: 'Reservation',
  'room-service': 'Room Service',
  restaurants: 'Restaurants',
  spa: 'Spa & Wellness',
  'beach-pools': 'Beach & Pools',
  events: 'Events',
  'kids-care': 'Kids Care',
  'ai-assistant': 'AI Assistant',
  feedback: 'Feedback',
}

export function GuestBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/')
          const label = LABELS[segment] ?? segment
          const isLast = index === segments.length - 1
          const isFirst = index === 0

          return (
            <Fragment key={href}>
              {!isFirst && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
              <BreadcrumbItem className={!isFirst ? 'hidden md:block' : ''}>
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
