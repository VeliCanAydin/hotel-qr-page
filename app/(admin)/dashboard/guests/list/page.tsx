export const dynamic = 'force-dynamic'

import { getReservations } from '@/lib/actions/reservations'
import GuestsListClient from './guests-list-client'

export default async function GuestsListPage() {
  const reservationList = await getReservations()
  return <GuestsListClient initialReservations={reservationList} />
}
