import { getBeachPoolsInfo } from '@/lib/actions/beach-pools'
import BeachPoolsClient from './beach-pools-client'


export default async function BeachPoolsAdminPage() {
  const info = await getBeachPoolsInfo()
  return <BeachPoolsClient initialData={info} />
}
