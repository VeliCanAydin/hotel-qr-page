import type { HotelEvent } from '@/lib/types/events'
import { toHotelDateISO } from '@/lib/dates'

type EventSlot = {
  dayOffset: number
  startTime: string
  endTime: string
  title: string
  description: string
  location: string
  category: HotelEvent['category']
  color?: string
}

type WeeklyPlan = {
  weekStart: string
  theme: string
  intro: string
  slots: EventSlot[]
}

function formatDateToLocal(date: Date): string {
  return toHotelDateISO(date)
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function makeId(date: string, title: string, index: number): string {
  return `${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`.replace(/^-+|-+$/g, '')
}

function buildWeek(plan: WeeklyPlan): HotelEvent[] {
  const start = parseDate(plan.weekStart)

  return plan.slots.map((slot, index) => {
    const date = formatDateToLocal(addDays(start, slot.dayOffset))

    return {
      id: makeId(date, `${plan.theme}-${slot.title}`, index),
      title: `${plan.theme}: ${slot.title}`,
      description: `${plan.intro} ${slot.description}`,
      location: slot.location,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      category: slot.category,
      color: slot.color,
    }
  })
}

const fullWeekSlots: EventSlot[] = [
  { dayOffset: 0, startTime: '07:00', endTime: '08:00', title: 'Sunrise Yoga', description: 'A calm sunrise session on the pool deck with breathwork and gentle stretching.', location: 'Pool Deck', category: 'wellness' },
  { dayOffset: 0, startTime: '10:30', endTime: '11:30', title: 'Aqua Aerobics', description: 'An energetic water fitness class led by our entertainment team in the main pool.', location: 'Main Pool', category: 'sports' },
  { dayOffset: 1, startTime: '10:00', endTime: '12:00', title: 'Kids Creative Studio', description: 'Arts, crafts, and themed activities for children with age-appropriate supervision.', location: 'Kids Club', category: 'kids' },
  { dayOffset: 1, startTime: '14:30', endTime: '15:30', title: 'Chef Market Demo', description: 'Our chef shares local ingredients, kitchen tips, and live tasting samples.', location: 'Culinary Studio', category: 'dining' },
  { dayOffset: 2, startTime: '11:00', endTime: '12:00', title: 'Beach Volleyball Challenge', description: 'A friendly match on the sand with mixed teams and a casual prize for winners.', location: 'Beach Sports Area', category: 'sports' },
  { dayOffset: 3, startTime: '16:00', endTime: '17:30', title: 'Spa Discovery Hour', description: 'A guided wellness session introducing hammam rituals, relaxation tips, and treatment options.', location: 'Spa Terrace', category: 'wellness' },
  { dayOffset: 4, startTime: '18:30', endTime: '20:00', title: 'Turkish Tea & Lokum', description: 'A traditional tasting break with tea service, lokum, and relaxed conversation.', location: 'Lobby Lounge', category: 'dining' },
  { dayOffset: 5, startTime: '19:30', endTime: '21:00', title: 'Acoustic Sunset', description: 'Live acoustic music as the sun sets, featuring a mix of local and international songs.', location: 'Sunset Bar', category: 'music' },
  { dayOffset: 6, startTime: '10:30', endTime: '12:00', title: 'Family Brunch Buffet', description: 'A long brunch service with fresh pastries, fruits, omelets, and hot dishes for every taste.', location: 'Main Restaurant', category: 'dining' },
  { dayOffset: 6, startTime: '20:30', endTime: '22:00', title: 'Mini Disco & Movie Night', description: 'Kids dance time followed by a family-friendly movie under the evening lights.', location: 'Amphitheater', category: 'entertainment' },
]

const closingWeekSlots: EventSlot[] = [
  { dayOffset: 0, startTime: '07:00', endTime: '08:00', title: 'Sunrise Yoga', description: 'A peaceful final-week sunrise session with a focus on breathing and balance.', location: 'Pool Deck', category: 'wellness' },
  { dayOffset: 0, startTime: '09:30', endTime: '10:30', title: 'Pool Stretch Session', description: 'A light mobility class to keep guests active and refreshed before lunch.', location: 'Main Pool', category: 'wellness' },
  { dayOffset: 0, startTime: '11:00', endTime: '12:00', title: 'Kids Water Games', description: 'Supervised splash games and playful competitions for younger guests.', location: 'Kids Pool', category: 'kids' },
  { dayOffset: 0, startTime: '14:00', endTime: '15:00', title: 'Chef Live Station', description: 'A live cooking corner with seasonal ingredients and quick tasting plates.', location: 'Beach Restaurant Terrace', category: 'dining' },
  { dayOffset: 0, startTime: '17:00', endTime: '18:00', title: 'Wine & Cheese Hour', description: 'A relaxed afternoon pairing with selected cheeses and regional wines.', location: 'Lobby Lounge', category: 'dining' },
  { dayOffset: 1, startTime: '10:00', endTime: '11:00', title: 'Beach Volleyball Finale', description: 'The final beach volleyball match of the month with an easygoing hotel crowd.', location: 'Beach Sports Area', category: 'sports' },
  { dayOffset: 1, startTime: '12:30', endTime: '13:30', title: 'Ice Cream Social', description: 'A family treat with seasonal flavors and a casual midday gathering.', location: 'Snack Bar', category: 'dining' },
  { dayOffset: 1, startTime: '16:00', endTime: '17:00', title: 'Spa Farewell Ritual', description: 'A closing relaxation session with tea service, aromas, and calming music.', location: 'Spa Garden', category: 'wellness' },
  { dayOffset: 1, startTime: '19:30', endTime: '21:00', title: 'Sunset Live Music', description: 'An evening performance with live vocals and soft lounge arrangements.', location: 'Sunset Bar', category: 'music' },
  { dayOffset: 1, startTime: '21:15', endTime: '22:15', title: 'Grand Finale Party', description: 'A final celebration with music, dance, and a warm send-off atmosphere.', location: 'Amphitheater', category: 'entertainment' },
]

const weeklyPlans: WeeklyPlan[] = [
  { weekStart: '2026-05-04', theme: 'Spring Opening Week', intro: 'To welcome the season, this week combines movement, family activities, and relaxed evening entertainment.', slots: fullWeekSlots },
  { weekStart: '2026-05-11', theme: 'Family Discovery Week', intro: 'This schedule is built for families looking for light adventure, shared meals, and easygoing poolside fun.', slots: fullWeekSlots },
  { weekStart: '2026-05-18', theme: 'Seaside Wellness Week', intro: 'Guests can unwind with wellness moments, beach activities, and calm social evenings.', slots: fullWeekSlots },
  { weekStart: '2026-05-25', theme: 'Taste of the Coast Week', intro: 'A food-focused week with local tasting sessions, outdoor dining, and sunset gatherings.', slots: fullWeekSlots },
  { weekStart: '2026-06-01', theme: 'Kids Festival Week', intro: 'A playful weekly lineup designed to keep children active while adults enjoy resort relaxation.', slots: fullWeekSlots },
  { weekStart: '2026-06-08', theme: 'Sunset Music Week', intro: 'Evenings center on live music, social moments, and low-key entertainment by the sea.', slots: fullWeekSlots },
  { weekStart: '2026-06-15', theme: 'Active Holiday Week', intro: 'A more energetic program that balances sports, wellness, and group-friendly daytime events.', slots: fullWeekSlots },
  { weekStart: '2026-06-22', theme: 'Relax and Recharge Week', intro: 'The focus shifts to recovery, gentle movement, and long summer evenings with live performance.', slots: fullWeekSlots },
  { weekStart: '2026-06-29', theme: 'Grand Finale Week', intro: 'The final program closes June with a strong mix of wellness, family fun, and a celebratory finale.', slots: closingWeekSlots },
]

export const hotelEvents: HotelEvent[] = weeklyPlans.flatMap((plan) => buildWeek(plan))