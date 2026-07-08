import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware navigation helpers. Every guest-surface import of `next/link`
// and `next/navigation` is replaced by these so links/redirects keep the active
// locale prefix without threading it through by hand.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
