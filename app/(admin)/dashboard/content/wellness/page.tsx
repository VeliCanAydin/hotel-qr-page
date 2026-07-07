import { getWellnessServices } from '@/lib/actions/wellness-services'
import WellnessClient from './wellness-client'


export default async function WellnessAdminPage() {
  const services = await getWellnessServices()
  return <WellnessClient initialServices={services} />
}
