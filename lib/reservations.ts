import { and, desc, eq, gte, lte, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { todayISO } from '@/lib/dates'

export type Reservation = typeof reservations.$inferSelect

/** Login-time lookup — room + surname (case-insensitive), stay started and not
 *  ended. The checkIn bound also picks the right reservation when today's
 *  departing and arriving guests briefly coexist on the same room. */
export async function findReservationForLogin(
  roomNumber: string,
  surname: string
): Promise<Reservation | null> {
  const today = todayISO()
  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.roomNumber, roomNumber.trim()),
        sql`lower(${reservations.surname}) = ${surname.trim().toLowerCase()}`,
        ne(reservations.status, 'checked-out'),
        lte(reservations.checkIn, today),
        gte(reservations.checkOut, today)
      )
    )
    .orderBy(desc(reservations.checkOut))
    .limit(1)

  return rows[0] ?? null
}

/** Current occupant of a room, if any — used to route room-keyed events
 *  (e.g. support request updates) to the right stay's push subscriptions. */
export async function findActiveReservationByRoom(
  roomNumber: string
): Promise<Reservation | null> {
  const today = todayISO()
  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.roomNumber, roomNumber.trim()),
        ne(reservations.status, 'checked-out'),
        lte(reservations.checkIn, today),
        gte(reservations.checkOut, today)
      )
    )
    .orderBy(desc(reservations.checkOut))
    .limit(1)

  return rows[0] ?? null
}

/** Post-login lookup — reservationCode is unique per stay. Returns null once
 *  the stay ended or staff checked the guest out, which drops portal access. */
export async function findActiveReservation(
  reservationCode: string
): Promise<Reservation | null> {
  const today = todayISO()
  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.reservationCode, reservationCode),
        ne(reservations.status, 'checked-out'),
        lte(reservations.checkIn, today),
        gte(reservations.checkOut, today)
      )
    )
    .limit(1)

  return rows[0] ?? null
}
