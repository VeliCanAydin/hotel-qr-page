import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/data/mockReservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CalendarCheck,
  CalendarX,
  Moon,
  Users,
  BedDouble,
  Building2,
  Eye,
  Layers,
  Hash,
  UtensilsCrossed,
} from 'lucide-react'
import { differenceInDays, format, parseISO } from 'date-fns'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  confirmed: 'outline',
  'checked-in': 'default',
  'checked-out': 'secondary',
}

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {reservation.guestName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dosinia Luxury Resort — Your stay overview
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[reservation.status]}>
          {STATUS_LABELS[reservation.status]}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stay Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Check-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(checkInDate, 'MMM d, yyyy')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(checkInDate, 'EEEE')} · from 14:00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarX className="h-4 w-4" />
              Check-Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(checkOutDate, 'MMM d, yyyy')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(checkOutDate, 'EEEE')} · by 12:00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Nights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNights}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {nightsRemaining > 0
                ? `${nightsRemaining} night${nightsRemaining !== 1 ? 's' : ''} remaining`
                : 'Stay complete'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Room Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" /> Room Number
              </span>
              <span className="font-medium">{reservation.roomNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" /> Room Type
              </span>
              <span className="font-medium">{ROOM_LABELS[reservation.roomType]}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4" /> Floor
              </span>
              <span className="font-medium">{reservation.floor}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" /> View
              </span>
              <span className="font-medium">{reservation.view}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <BedDouble className="h-4 w-4" /> Bed Type
              </span>
              <span className="font-medium">{reservation.bedType}</span>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservation Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" /> Code
              </span>
              <span className="font-mono font-medium">{reservation.reservationCode}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <UtensilsCrossed className="h-4 w-4" /> Board
              </span>
              <span className="font-medium">{BOARD_LABELS[reservation.boardType]}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" /> Guests
              </span>
              <span className="font-medium">
                {reservation.adults} adult{reservation.adults !== 1 ? 's' : ''}
                {reservation.children > 0
                  ? `, ${reservation.children} child${reservation.children !== 1 ? 'ren' : ''}`
                  : ''}
              </span>
            </div>
            {reservation.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">{reservation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
