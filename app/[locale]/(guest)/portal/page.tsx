import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickRequests } from '@/components/guest/quick-requests'
import { PushNotificationCard } from '@/components/guest/push-notification-card'
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

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('portal')
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (!token) redirect(`/${locale}/login`)

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect(`/${locale}/login`)

  const reservation = await findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect(`/${locale}/login`)

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
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{t('checkIn')}</p>
              <p className="font-semibold text-sm">{format(checkInDate, 'MMM d')}</p>
              <p className="text-xs text-muted-foreground">{format(checkInDate, 'EEE')} · 14:00</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 p-3 text-center">
              <p className="text-3xl font-bold leading-none">{totalNights}</p>
              <p className="text-[11px] text-muted-foreground">
                {nightsRemaining > 0
                  ? t('nightsLeft', { n: nightsRemaining })
                  : t('stayComplete')}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{t('checkOut')}</p>
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
            <CardTitle className="text-l font-bold">{t('roomDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <DetailRow icon={Hash} label={t('room')} value={reservation.roomNumber} />
            <DetailRow icon={Building2} label={t('type')} value={t(`roomTypes.${reservation.roomType}`)} />
            <DetailRow icon={Layers} label={t('floor')} value={String(reservation.floor)} />
            <DetailRow icon={Eye} label={t('view')} value={reservation.view} />
            <DetailRow icon={BedDouble} label={t('bed')} value={reservation.bedType} />
          </CardContent>
        </Card>

        <Card className='gap-3'>
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-l font-bold">{t('reservation')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <DetailRow icon={Hash} label={t('code')} value={reservation.reservationCode} mono />
            <DetailRow icon={UtensilsCrossed} label={t('board')} value={t(`boardTypes.${reservation.boardType}`)} />
            <DetailRow
              icon={Users}
              label={t('guests')}
              value={
                String(reservation.adults) +
                (reservation.children > 0
                  ? t('childrenSuffix', { count: reservation.children })
                  : '')
              }
            />
            {reservation.notes && (
              <p className="pt-1 text-xs text-muted-foreground border-t">{reservation.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* One-tap housekeeping / front-desk requests */}
      <QuickRequests />

      {/* Web push opt-in for order/request status updates */}
      <PushNotificationCard />
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
