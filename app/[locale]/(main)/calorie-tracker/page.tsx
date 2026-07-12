import CalorieTrackerClient from './calorie-tracker-client'
import { setRequestLocale } from 'next-intl/server'

export default async function CalorieTrackerPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CalorieTrackerClient />
}
