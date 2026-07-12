import { verifySession } from '@/lib/auth'
import CalorieTrackerClient from './calorie-tracker-client'

export default async function CalorieTrackerContainer({ locale }: { locale: string }) {
  // Verify guest or staff session
  const session = await verifySession()
  const isAuthorized = session !== null

  return <CalorieTrackerClient isAuthorized={isAuthorized} />
}
