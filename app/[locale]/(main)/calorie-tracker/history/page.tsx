import { Suspense } from 'react'
import CalorieHistoryContainer from './history-container'
import { setRequestLocale } from 'next-intl/server'

export default async function CalorieHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#45a7d7]"></div>
      </div>
    }>
      <CalorieHistoryContainer locale={locale} />
    </Suspense>
  )
}
