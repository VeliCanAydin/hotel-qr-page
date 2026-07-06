// Demo reservation data — used ONLY as a seed source (lib/db/seed.ts,
// lib/db/migrate-reservations.ts). Runtime lookups live in lib/reservations.ts
// and read the `reservations` table.
//
// Dates are computed relative to "today" at seed time so the demo guests can
// always log in to the portal after a fresh `npm run db:seed`.

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'villa'
export type BoardType = 'room-only' | 'bed-breakfast' | 'half-board' | 'full-board' | 'all-inclusive'
export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out'

export interface GuestReservation {
  roomNumber: string
  surname: string
  reservationCode: string
  guestName: string
  roomType: RoomType
  boardType: BoardType
  status: ReservationStatus
  checkIn: string
  checkOut: string
  adults: number
  children: number
  floor: number
  view: string
  bedType: string
  email: string
  phone: string
  notes?: string
}

function daysFromToday(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const mockReservations: GuestReservation[] = [
  {
    roomNumber: '204',
    surname: 'johnson',
    reservationCode: 'DOS-2026-4821',
    guestName: 'Mr. & Mrs. Johnson',
    roomType: 'deluxe',
    boardType: 'all-inclusive',
    status: 'checked-in',
    checkIn: daysFromToday(-3),
    checkOut: daysFromToday(4),
    adults: 2,
    children: 0,
    floor: 2,
    view: 'Sea View',
    bedType: 'King',
    email: 'j.johnson@example.com',
    phone: '+1 555 0142',
  },
  {
    roomNumber: '315',
    surname: 'mueller',
    reservationCode: 'DOS-2026-5103',
    guestName: 'Familie Mueller',
    roomType: 'suite',
    boardType: 'all-inclusive',
    status: 'checked-in',
    checkIn: daysFromToday(-5),
    checkOut: daysFromToday(5),
    adults: 2,
    children: 2,
    floor: 3,
    view: 'Garden View',
    bedType: 'King',
    email: 'hans.mueller@example.de',
    phone: '+49 170 5551234',
    notes: 'Baby crib requested, nut allergy noted',
  },
  {
    roomNumber: '101',
    surname: 'yilmaz',
    reservationCode: 'DOS-2026-5287',
    guestName: 'Yılmaz Ailesi',
    roomType: 'standard',
    boardType: 'full-board',
    status: 'confirmed',
    checkIn: daysFromToday(1),
    checkOut: daysFromToday(8),
    adults: 2,
    children: 1,
    floor: 1,
    view: 'Pool View',
    bedType: 'Twin',
    email: 'ayse.yilmaz@example.com',
    phone: '+90 532 5550001',
  },
  {
    roomNumber: '512',
    surname: 'chen',
    reservationCode: 'DOS-2026-5419',
    guestName: 'Chen Family',
    roomType: 'villa',
    boardType: 'all-inclusive',
    status: 'checked-in',
    checkIn: daysFromToday(-2),
    checkOut: daysFromToday(6),
    adults: 2,
    children: 3,
    floor: 5,
    view: 'Sea View',
    bedType: 'King',
    email: 'wei.chen@example.com',
    phone: '+86 138 0013 8000',
    notes: 'Late check-out requested',
  },
  {
    roomNumber: '777',
    surname: 'test',
    reservationCode: 'DOS-2026-7777',
    guestName: 'Test Guest',
    roomType: 'suite',
    boardType: 'all-inclusive',
    status: 'checked-in',
    checkIn: daysFromToday(-1),
    checkOut: daysFromToday(7),
    adults: 2,
    children: 1,
    floor: 7,
    view: 'Sea View',
    bedType: 'King',
    email: 'test.guest@example.com',
    phone: '+90 555 777 77 77',
    notes: 'Test record for login and guest portal validation',
  },
]
