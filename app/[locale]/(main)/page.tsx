import { getTranslations, setRequestLocale } from 'next-intl/server'
import PageCard from '@/components/page-card'
import { pages } from '@/lib/pages'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-8">
      <div className="grid grid-cols-2 gap-3 auto-rows-fr">
        {pages.map((page) => (
          <PageCard
            key={page.key}
            icon={page.icon}
            href={page.href}
            title={t(`${page.key}.title`)}
            description={t(`${page.key}.description`)}
          />
        ))}
      </div>
    </div>
  )
}
