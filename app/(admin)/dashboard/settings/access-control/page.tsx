import { getAccessControlSnapshot } from '@/lib/access-store'
import AccessControlClient from './access-control-client'

export const dynamic = 'force-dynamic'

export default async function AccessControlPage() {
  const snapshot = await getAccessControlSnapshot()
  return <AccessControlClient initialData={snapshot} />
}