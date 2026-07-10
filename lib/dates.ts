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

const hotelTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: HOTEL_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Current hotel wall-clock time as minutes since midnight (0–1439). Used to
 *  compare against HH:mm text time columns (e.g. events.startTime). */
export function nowHotelMinutes(): number {
  const [hours, minutes] = hotelTimeFormatter.format(new Date()).split(':').map(Number)
  return hours * 60 + minutes
}

// --- Guest-facing display formatters ---
// Locale-aware replacements for hardcoded date-fns English tokens. `locale`
// always comes from the URL segment (params / useLocale), never from cookies.

/** Short weekday name, e.g. "Mon" / "Pzt" / "Пн". */
export function formatWeekdayShort(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
}

/** Short month + day, e.g. "Sep 5" / "5 Eyl". */
export function formatMonthDay(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date)
}

/** Short month + day + year, e.g. "Sep 5, 2026" / "5 Eyl 2026". */
export function formatMonthDayYear(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

/** Date with 24h time, e.g. "Sep 5, 2026 · 14:30". */
export function formatDateTime(date: Date, locale: string): string {
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
  return `${formatMonthDayYear(date, locale)} · ${time}`
}
