import CalorieHistoryClient from './history-client'
import { setRequestLocale } from 'next-intl/server'

export default async function CalorieHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CalorieHistoryClient />
}
