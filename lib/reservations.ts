import { and, desc, eq, gte, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'

export type Reservation = typeof reservations.$inferSelect

// Local calendar date as YYYY-MM-DD — checkIn/checkOut columns are text in the
// same format, so string comparison is safe.
function todayISO(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Login-time lookup — room + surname (case-insensitive), stay not ended. */
export async function findReservationForLogin(
  roomNumber: string,
  surname: string
): Promise<Reservation | null> {
  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.roomNumber, roomNumber.trim()),
        sql`lower(${reservations.surname}) = ${surname.trim().toLowerCase()}`,
        ne(reservations.status, 'checked-out'),
        gte(reservations.checkOut, todayISO())
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
  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.reservationCode, reservationCode),
        ne(reservations.status, 'checked-out'),
        gte(reservations.checkOut, todayISO())
      )
    )
    .limit(1)

  return rows[0] ?? null
}
