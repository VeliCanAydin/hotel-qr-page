import { getTranslationEntries } from '@/lib/actions/translations'
import TranslationsClient from './translations-client'

// No route segment config needed: cacheComponents makes this dynamic by
// default, and getTranslationEntries reads cookies via requireAdmin anyway.
const DEFAULT_ENTITY_TYPE = 'spa_service'
const DEFAULT_LOCALE = 'tr'

export default async function TranslationsAdminPage() {
  const initialEntries = await getTranslationEntries(DEFAULT_ENTITY_TYPE, DEFAULT_LOCALE)
  return (
    <TranslationsClient
      initialEntityType={DEFAULT_ENTITY_TYPE}
      initialLocale={DEFAULT_LOCALE}
      initialEntries={initialEntries}
    />
  )
}
