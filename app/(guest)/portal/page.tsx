import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/data/mockReservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  BedDouble,
  Building2,
  Eye,
  Layers,
  Hash,
  UtensilsCrossed,
} from 'lucide-react'
import { differenceInDays, format, parseISO } from 'date-fns'

const BOARD_LABELS: Record<string, string> = {
  'room-only': 'Room Only',
  'bed-breakfast': 'Bed & Breakfast',
  'half-board': 'Half Board',
  'full-board': 'Full Board',
  'all-inclusive': 'All Inclusive',
}

const ROOM_LABELS: Record<string, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
  villa: 'Villa',
}

export default async function PortalPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (!token) redirect('/login')

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect('/login')

  const reservation = findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect('/login')

  const checkInDate = parseISO(reservation.checkIn)
  const checkOutDate = parseISO(reservation.checkOut)
  const today = new Date()
  const totalNights = differenceInDays(checkOutDate, checkInDate)
  const nightsRemaining = Math.max(0, differenceInDays(checkOutDate, today))

  return (
    <div className="space-y-4">
      {/* Stay timeline */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-3 divide-x">
            <div className="flex flex-col items-center gap-0.5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Check-In</p>
              <p className="font-semibold text-sm">{format(checkInDate, 'MMM d')}</p>
              <p className="text-xs text-muted-foreground">{format(checkInDate, 'EEE')} · 14:00</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 p-3 text-center bg-muted/40">
              <p className="text-3xl font-bold leading-none">{totalNights}</p>
              <p className="text-[11px] text-muted-foreground">
                {nightsRemaining > 0
                  ? `${nightsRemaining} night${nightsRemaining !== 1 ? 's' : ''} left`
                  : 'Stay complete'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Check-Out</p>
              <p className="font-semibold text-sm">{format(checkOutDate, 'MMM d')}</p>
              <p className="text-xs text-muted-foreground">{format(checkOutDate, 'EEE')} · 12:00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room & Reservation details */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className='gap-3'>
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-l font-bold">Room Details</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <DetailRow icon={Hash} label="Room" value={reservation.roomNumber} />
            <DetailRow icon={Building2} label="Type" value={ROOM_LABELS[reservation.roomType]} />
            <DetailRow icon={Layers} label="Floor" value={String(reservation.floor)} />
            <DetailRow icon={Eye} label="View" value={reservation.view} />
            <DetailRow icon={BedDouble} label="Bed" value={reservation.bedType} />
          </CardContent>
        </Card>

        <Card className='gap-3'>
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-l font-bold">Reservation</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <DetailRow icon={Hash} label="Code" value={reservation.reservationCode} mono />
            <DetailRow icon={UtensilsCrossed} label="Board" value={BOARD_LABELS[reservation.boardType]} />
            <DetailRow
              icon={Users}
              label="Guests"
              value={
                reservation.adults +
                (reservation.children > 0
                  ? ` + ${reservation.children} child${reservation.children !== 1 ? 'ren' : ''}`
                  : '')
              }
            />
            {reservation.notes && (
              <p className="pt-1 text-xs text-muted-foreground border-t">{reservation.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className={mono ? 'font-mono font-medium text-xs' : 'font-medium text-right'}>
        {value}
      </span>
    </div>
  )
}
