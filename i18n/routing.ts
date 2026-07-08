import { defineRouting } from 'next-intl/routing'

// Single source of truth for the locale set. Adding a language = add it here,
// add a messages/<locale>.json file, and enter translations from the admin
// Translations page. `en` is the base/fallback locale (content_translations has
// no rows for it — base DB columns are already English).
export const LOCALES = ['en', 'tr', 'de', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  // localePrefix defaults to 'always' — the bare QR root ("/") is redirected to
  // a locale by the intl middleware using the Accept-Language header.
})
