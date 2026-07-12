// Push notification texts in all four guest languages. Server-only plain
// constants, deliberately NOT next-intl (server actions have no request locale)
// and NOT a 'use server' module — the locale comes from the reservation's
// `locale` column, picked by the staff-triggered actions that send pushes.
import { LOCALES, type Locale } from '@/i18n/routing'
import type { PushPayload } from '@/lib/push'

/** Reservation rows store locale as plain text; unknown values fall back to en. */
export function toLocale(value: string | null | undefined): Locale {
  return (LOCALES as readonly string[]).includes(value ?? '') ? (value as Locale) : 'en'
}

/** Portal deep link in the guest's language (localePrefix is 'always'). */
const portalUrl = (locale: Locale, path: '' | '/room-service' = '') => `/${locale}/portal${path}`

type PerLocale = Record<Locale, string>

const ORDER_TITLES: Record<'confirmed' | 'on_the_way' | 'delivered' | 'cancelled', PerLocale> = {
  confirmed: {
    en: 'Order confirmed',
    tr: 'Sipariş onaylandı',
    de: 'Bestellung bestätigt',
    ru: 'Заказ подтверждён',
  },
  on_the_way: {
    en: 'Order on the way',
    tr: 'Sipariş yolda',
    de: 'Bestellung unterwegs',
    ru: 'Заказ в пути',
  },
  delivered: {
    en: 'Order delivered',
    tr: 'Sipariş teslim edildi',
    de: 'Bestellung geliefert',
    ru: 'Заказ доставлен',
  },
  cancelled: {
    en: 'Order cancelled',
    tr: 'Sipariş iptal edildi',
    de: 'Bestellung storniert',
    ru: 'Заказ отменён',
  },
}

const ORDER_BODIES: Record<'confirmed' | 'on_the_way' | 'delivered' | 'cancelled', Record<Locale, (id: number) => string>> = {
  confirmed: {
    en: (id) => `Your room service order #${id} is being prepared.`,
    tr: (id) => `#${id} numaralı oda servisi siparişiniz hazırlanıyor.`,
    de: (id) => `Ihre Zimmerservice-Bestellung Nr. ${id} wird zubereitet.`,
    ru: (id) => `Ваш заказ в номер №${id} готовится.`,
  },
  on_the_way: {
    en: (id) => `Your room service order #${id} has been prepared and is on the way.`,
    tr: (id) => `#${id} numaralı oda servisi siparişiniz hazırlandı ve yola çıktı.`,
    de: (id) => `Ihre Zimmerservice-Bestellung Nr. ${id} wurde zubereitet und ist unterwegs.`,
    ru: (id) => `Ваш заказ в номер №${id} подготовлен и уже в пути.`,
  },
  delivered: {
    en: (id) => `Your room service order #${id} has been delivered. Enjoy!`,
    tr: (id) => `#${id} numaralı oda servisi siparişiniz teslim edildi. Afiyet olsun!`,
    de: (id) => `Ihre Zimmerservice-Bestellung Nr. ${id} wurde geliefert. Guten Appetit!`,
    ru: (id) => `Ваш заказ в номер №${id} доставлен. Приятного аппетита!`,
  },
  cancelled: {
    en: (id) => `Your room service order #${id} was cancelled.`,
    tr: (id) => `#${id} numaralı oda servisi siparişiniz iptal edildi.`,
    de: (id) => `Ihre Zimmerservice-Bestellung Nr. ${id} wurde storniert.`,
    ru: (id) => `Ваш заказ в номер №${id} был отменён.`,
  },
}

export function orderStatusPush(
  rawLocale: string,
  status: 'confirmed' | 'on_the_way' | 'delivered' | 'cancelled',
  orderId: number,
  cancellationReason?: string,
): PushPayload {
  const locale = toLocale(rawLocale)
  let body = ORDER_BODIES[status][locale](orderId)
  if (status === 'cancelled' && cancellationReason) {
    // Staff-typed reason stays as written — free text is never translated.
    body = `${body.slice(0, -1)}: ${cancellationReason}`
  }
  return { title: ORDER_TITLES[status][locale], body, url: portalUrl(locale, '/room-service') }
}

const SUPPORT_TITLES: Record<'resolved' | 'update', PerLocale> = {
  resolved: {
    en: 'Request resolved',
    tr: 'Talebiniz çözüldü',
    de: 'Anfrage gelöst',
    ru: 'Запрос решён',
  },
  update: {
    en: 'Request update',
    tr: 'Talebinizde güncelleme',
    de: 'Update zu Ihrer Anfrage',
    ru: 'Обновление по запросу',
  },
}

const SUPPORT_HANDLED_BODIES: Record<Locale, (subject: string) => string> = {
  en: (subject) => `Your request "${subject}" is being handled by our team.`,
  tr: (subject) => `"${subject}" talebiniz ekibimiz tarafından ilgileniliyor.`,
  de: (subject) => `Ihre Anfrage „${subject}“ wird von unserem Team bearbeitet.`,
  ru: (subject) => `Ваш запрос «${subject}» обрабатывается нашей командой.`,
}

export function supportRequestPush(
  rawLocale: string,
  resolved: boolean,
  subject: string,
  staffResponse: string,
): PushPayload {
  const locale = toLocale(rawLocale)
  return {
    title: SUPPORT_TITLES[resolved ? 'resolved' : 'update'][locale],
    // The staff reply itself is free text and shown as written.
    body: staffResponse
      ? `"${subject}" — ${staffResponse.slice(0, 140)}`
      : SUPPORT_HANDLED_BODIES[locale](subject),
    url: portalUrl(locale),
  }
}

/** Guest events page in the guest's language. */
const eventsUrl = (locale: Locale) => `/${locale}/events`

/** "Jul 15 · 18:00" in the guest's language — plain Intl, no next-intl. */
function formatEventWhen(locale: Locale, date: string, startTime: string): string {
  const day = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
    new Date(`${date}T00:00:00`)
  )
  return `${day} · ${startTime}`
}

const EVENT_NEW_TITLES: PerLocale = {
  en: 'New event at the hotel',
  tr: 'Otelde yeni etkinlik',
  de: 'Neues Event im Hotel',
  ru: 'Новое событие в отеле',
}

const EVENT_NEW_BODIES: Record<Locale, (title: string, when: string, location: string) => string> = {
  en: (title, when, location) => `${title} — ${when}, ${location}. Tap for details.`,
  tr: (title, when, location) => `${title} — ${when}, ${location}. Detaylar için dokunun.`,
  de: (title, when, location) => `${title} — ${when}, ${location}. Für Details tippen.`,
  ru: (title, when, location) => `${title} — ${when}, ${location}. Нажмите, чтобы узнать больше.`,
}

export function eventAnnouncementPush(
  rawLocale: string,
  title: string,
  date: string,
  startTime: string,
  location: string,
): PushPayload {
  const locale = toLocale(rawLocale)
  return {
    title: EVENT_NEW_TITLES[locale],
    body: EVENT_NEW_BODIES[locale](title, formatEventWhen(locale, date, startTime), location),
    url: eventsUrl(locale),
  }
}

const EVENT_REMINDER_TITLES: PerLocale = {
  en: 'Starting soon',
  tr: 'Birazdan başlıyor',
  de: 'Beginnt gleich',
  ru: 'Скоро начнётся',
}

const EVENT_REMINDER_BODIES: Record<Locale, (title: string, time: string, location: string) => string> = {
  en: (title, time, location) => `${title} starts at ${time} — ${location}.`,
  tr: (title, time, location) => `${title} birazdan başlıyor: ${time} — ${location}.`,
  de: (title, time, location) => `${title} beginnt um ${time} — ${location}.`,
  ru: (title, time, location) => `${title} начинается в ${time} — ${location}.`,
}

export function eventReminderPush(
  rawLocale: string,
  title: string,
  startTime: string,
  location: string,
): PushPayload {
  const locale = toLocale(rawLocale)
  return {
    title: EVENT_REMINDER_TITLES[locale],
    body: EVENT_REMINDER_BODIES[locale](title, startTime, location),
    url: eventsUrl(locale),
  }
}

const CHECK_IN_TITLES: PerLocale = {
  en: 'Check-in confirmed',
  tr: 'Check-in onaylandı',
  de: 'Check-in bestätigt',
  ru: 'Заезд подтверждён',
}

const CHECK_IN_BODIES: Record<Locale, (roomNumber: string) => string> = {
  en: (room) => `Welcome! Your check-in for room ${room} is confirmed.`,
  tr: (room) => `Hoş geldiniz! ${room} numaralı oda için check-in işleminiz onaylandı.`,
  de: (room) => `Willkommen! Ihr Check-in für Zimmer ${room} ist bestätigt.`,
  ru: (room) => `Добро пожаловать! Ваш заезд в номер ${room} подтверждён.`,
}

export function checkInPush(rawLocale: string, roomNumber: string): PushPayload {
  const locale = toLocale(rawLocale)
  return {
    title: CHECK_IN_TITLES[locale],
    body: CHECK_IN_BODIES[locale](roomNumber),
    url: portalUrl(locale),
  }
}
