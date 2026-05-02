import { getSpaServices } from '@/lib/actions/spa-services'
import SpaClient from './spa-client'

export const dynamic = 'force-dynamic'

export default async function SpaAdminPage() {
  const services = await getSpaServices()
  return <SpaClient initialServices={services} />
}
