'use server'

import { db } from '@/lib/db'
import { reservations, roomServiceOrders } from '@/lib/db/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { todayISO } from '@/lib/dates'
import { deletePushSubscriptionsForReservation, sendPushToReservation } from '@/lib/push'
import { checkInPush } from '@/lib/push-messages'

export type Reservation = {
  id: number
  reservationCode: string
  roomNumber: string
  surname: string
  guestName: string
  roomType: string
  boardType: string
  status: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  floor: number
  view: string
  bedType: string
  email: string
  phone: string
  notes: string
  createdAt: Date
}

export type ReservationInput = {
  roomNumber: string
  surname: string
  guestName: string
  roomType: string
  boardType: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  floor: number
  view: string
  bedType: string
  email: string
  phone: string
  notes: string
}

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out'

const RESERVATIONS_PAGE = '/dashboard/guests/list'

function normalizeInput(input: ReservationInput) {
  return {
    roomNumber: input.roomNumber.trim(),
    surname: input.surname.trim(),
    guestName: input.guestName.trim(),
    roomType: input.roomType.trim(),
    boardType: input.boardType.trim(),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: Math.min(Math.max(Math.trunc(input.adults), 1), 12),
    children: Math.min(Math.max(Math.trunc(input.children), 0), 12),
    floor: Math.trunc(input.floor),
    view: input.view.trim(),
    bedType: input.bedType.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    notes: input.notes.trim(),
  }
}

function validateInput(data: ReturnType<typeof normalizeInput>) {
  if (!data.roomNumber || !data.surname || !data.guestName) {
    throw new Error('Room number, surname and guest name are required')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(data.checkOut)) {
    throw new Error('Check-in and check-out dates are required')
  }
  if (data.checkOut <= data.checkIn) {
    throw new Error('Check-out must be after check-in')
  }
}

async function generateReservationCode(): Promise<string> {
  const year = todayISO().slice(0, 4)
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `DOS-${year}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    const [existing] = await db
      .select({ id: reservations.id })
      .from(reservations)
      .where(eq(reservations.reservationCode, code))
      .limit(1)
    if (!existing) return code
  }
  throw new Error('Could not generate a unique reservation code')
}

export async function getReservations(): Promise<Reservation[]> {
  await requireAdmin(RESERVATIONS_PAGE)
  return db
    .select()
    .from(reservations)
    .orderBy(desc(reservations.checkIn))
}

export async function createReservation(input: ReservationInput): Promise<Reservation> {
  await requireAdmin(RESERVATIONS_PAGE)
  const data = normalizeInput(input)
  validateInput(data)

  const reservationCode = await generateReservationCode()
  const [created] = await db
    .insert(reservations)
    .values({ ...data, reservationCode, status: 'confirmed' })
    .returning()

  revalidatePath(RESERVATIONS_PAGE)
  return created
}

export async function updateReservation(id: number, input: ReservationInput): Promise<Reservation> {
  await requireAdmin(RESERVATIONS_PAGE)
  const data = normalizeInput(input)
  validateInput(data)

  const [updated] = await db
    .update(reservations)
    .set(data)
    .where(eq(reservations.id, id))
    .returning()
  if (!updated) throw new Error('Reservation not found')

  revalidatePath(RESERVATIONS_PAGE)
  return updated
}

export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<Reservation> {
  await requireAdmin(RESERVATIONS_PAGE)

  const [updated] = await db
    .update(reservations)
    .set({ status })
    .where(eq(reservations.id, id))
    .returning()
  if (!updated) throw new Error('Reservation not found')

  if (status === 'checked-in') {
    after(() =>
      sendPushToReservation(
        updated.reservationCode,
        checkInPush(updated.locale, updated.roomNumber)
      )
    )
  } else if (status === 'checked-out') {
    // The stay is over — its devices should stop receiving notifications.
    after(() => deletePushSubscriptionsForReservation(updated.reservationCode))
  }

  revalidatePath(RESERVATIONS_PAGE)
  return updated
}

/** Orders the kitchen hasn't finished yet — the check-out flow warns staff
 *  before ending a stay that still has one in flight. */
export async function getOpenRoomServiceOrderCount(reservationCode: string): Promise<number> {
  await requireAdmin(RESERVATIONS_PAGE)
  return db.$count(
    roomServiceOrders,
    and(
      eq(roomServiceOrders.reservationCode, reservationCode),
      inArray(roomServiceOrders.status, ['pending', 'confirmed'])
    )
  )
}

export async function deleteReservation(id: number): Promise<void> {
  await requireAdmin(RESERVATIONS_PAGE)
  await db.delete(reservations).where(eq(reservations.id, id))
  revalidatePath(RESERVATIONS_PAGE)
}
