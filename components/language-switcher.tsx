'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { LOCALES, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
  ru: 'Русский',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('header')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('changeLanguage')}>
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            disabled={l === locale}
            onClick={() => router.replace(pathname, { locale: l })}
            className="cursor-pointer"
          >
            {LOCALE_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
