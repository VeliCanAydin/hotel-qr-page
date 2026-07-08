'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'myStay', href: '/portal' },
  { key: 'roomService', href: '/portal/room-service' },
  { key: 'feedback', href: '/portal/feedback' },
] as const

export function PortalTabs() {
  const pathname = usePathname()
  const t = useTranslations('portal.tabs')

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
          {t(tab.key)}
        </Link>
      ))}
    </div>
  )
}
