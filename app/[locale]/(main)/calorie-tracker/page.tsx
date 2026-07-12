import { Suspense } from 'react'
import CalorieTrackerContainer from './calorie-tracker-container'
import { setRequestLocale } from 'next-intl/server'

export default async function CalorieTrackerPage({
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
      <CalorieTrackerContainer locale={locale} />
    </Suspense>
  )
}
