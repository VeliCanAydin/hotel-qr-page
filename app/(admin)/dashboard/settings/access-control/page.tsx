import { getAccessControlSnapshot } from '@/lib/access-store'
import AccessControlClient from './access-control-client'


export default async function AccessControlPage() {
  const snapshot = await getAccessControlSnapshot()
  return <AccessControlClient initialData={snapshot} />
}