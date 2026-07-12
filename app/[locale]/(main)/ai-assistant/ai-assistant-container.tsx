import { verifySession } from '@/lib/auth'
import AIAssistantClient from './ai-assistant-client'

export default async function AIAssistantContainer({ locale }: { locale: string }) {
  // Verify guest or staff session
  const session = await verifySession()
  const isAuthorized = session !== null

  return <AIAssistantClient isAuthorized={isAuthorized} />
}
