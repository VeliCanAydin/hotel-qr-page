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

export const mockReservations: GuestReservation[] = [
  {
    roomNumber: '204',
    surname: 'johnson',
    reservationCode: 'DOS-2026-4821',
    guestName: 'Mr. & Mrs. Johnson',
    roomType: 'deluxe',
    boardType: 'all-inclusive',
    status: 'checked-in',
    checkIn: '2026-05-01',
    checkOut: '2026-05-08',
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
    checkIn: '2026-04-30',
    checkOut: '2026-05-10',
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
    checkIn: '2026-05-05',
    checkOut: '2026-05-12',
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
    checkIn: '2026-04-28',
    checkOut: '2026-05-06',
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
    checkIn: '2026-05-26',
    checkOut: '2026-06-02',
    adults: 2,
    children: 1,
    floor: 7,
    view: 'Sea View',
    bedType: 'King',
    email: 'test.guest@example.com',
    phone: '+90 555 777 77 77',
    notes: 'Test record for login and guest portal validation',
  },
  {
    roomNumber: '404',
    surname: 'celik',
    reservationCode: 'DOS-2026-0404',
    guestName: 'Ahmet Çelik',
    roomType: 'suite',
    boardType: 'all-inclusive',
    status: 'checked-in',
    checkIn: '2026-06-14',
    checkOut: '2026-12-14',
    adults: 2,
    children: 1,
    floor: 4,
    view: 'Sea View',
    bedType: 'King',
    email: 'ahmet.celik@example.com',
    phone: '+90 555 123 4567',
    notes: '6-month stay for feature testing',
  },
]

/** Login time lookup — checks room+surname and that the stay hasn't ended. */
export function findReservation(
  roomNumber: string,
  surname: string
): GuestReservation | undefined {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return mockReservations.find(
    (r) =>
      r.roomNumber === roomNumber.trim() &&
      r.surname === surname.trim().toLowerCase() &&
      new Date(r.checkOut) >= today
  )
}

/** Post-login lookup — checks reservationCode (unique per stay) and expiry. */
export function findActiveReservation(
  reservationCode: string
): GuestReservation | undefined {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return mockReservations.find(
    (r) =>
      r.reservationCode === reservationCode &&
      new Date(r.checkOut) >= today
  )
}
