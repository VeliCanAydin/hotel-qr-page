import { Suspense } from 'react'
import AIAssistantContainer from './ai-assistant-container'
import { setRequestLocale } from 'next-intl/server'

export default async function AIAssistantPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AIAssistantContainer locale={locale} />
    </Suspense>
  )
}
