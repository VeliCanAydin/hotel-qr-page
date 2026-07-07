// Calendar-date helpers pinned to the hotel's wall clock. Vercel functions run
// in UTC, which trails Turkey by 3 hours around midnight — using the server's
// local date would keep ended stays alive (or start days late) between
// 00:00–03:00 hotel time.
const HOTEL_TIME_ZONE = 'Europe/Istanbul'

// en-CA locale formats as YYYY-MM-DD, matching the text date columns in the schema.
const hotelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: HOTEL_TIME_ZONE,
})

/** Formats an instant as the hotel-local calendar date (YYYY-MM-DD). */
export function toHotelDateISO(date: Date): string {
  return hotelDateFormatter.format(date)
}

/** Today's calendar date at the hotel as YYYY-MM-DD. */
export function todayISO(): string {
  return toHotelDateISO(new Date())
}
