'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'My Stay', href: '/portal' },
  { label: 'Room Service', href: '/portal/room-service' },
  { label: 'Feedback', href: '/portal/feedback' },
]

export function PortalTabs() {
  const pathname = usePathname()

  return (
    <div className="flex border-b">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
            pathname === tab.href
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
