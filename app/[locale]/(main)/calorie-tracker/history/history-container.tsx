import { verifySession } from '@/lib/auth'
import CalorieHistoryClient from './history-client'

export default async function CalorieHistoryContainer({ locale }: { locale: string }) {
  // Verify guest or staff session
  const session = await verifySession()
  const isAuthorized = session !== null

  return <CalorieHistoryClient isAuthorized={isAuthorized} />
}
