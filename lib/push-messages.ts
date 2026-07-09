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

const ORDER_TITLES: Record<'confirmed' | 'delivered' | 'cancelled', PerLocale> = {
  confirmed: {
    en: 'Order confirmed',
    tr: 'Sipariş onaylandı',
    de: 'Bestellung bestätigt',
    ru: 'Заказ подтверждён',
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

const ORDER_BODIES: Record<'confirmed' | 'delivered' | 'cancelled', Record<Locale, (id: number) => string>> = {
  confirmed: {
    en: (id) => `Your room service order #${id} is being prepared.`,
    tr: (id) => `#${id} numaralı oda servisi siparişiniz hazırlanıyor.`,
    de: (id) => `Ihre Zimmerservice-Bestellung Nr. ${id} wird zubereitet.`,
    ru: (id) => `Ваш заказ в номер №${id} готовится.`,
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
  status: 'confirmed' | 'delivered' | 'cancelled',
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
