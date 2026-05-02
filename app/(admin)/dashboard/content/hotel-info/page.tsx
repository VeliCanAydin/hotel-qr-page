import { getHotelInfo } from '@/lib/actions/hotel-info'
import HotelInfoClient from './hotel-info-client'

export const dynamic = 'force-dynamic'

export default async function HotelInfoAdminPage() {
  const info = await getHotelInfo()
  return <HotelInfoClient initialData={info} />
}
