'use server'

import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'

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

export async function getReservations(): Promise<Reservation[]> {
  await requireAdmin('/dashboard/guests/list')
  return db
    .select()
    .from(reservations)
    .orderBy(desc(reservations.checkIn))
}
