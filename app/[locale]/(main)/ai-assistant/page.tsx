import AIAssistantClient from './ai-assistant-client'
import { setRequestLocale } from 'next-intl/server'

export default async function AIAssistantPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AIAssistantClient />
}
