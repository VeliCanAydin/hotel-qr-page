// Single source of truth for which DB content is translatable. Pure constant,
// safe to import from both server and client (the admin Translations page reads
// it too). Each key is the `entityType` stored in content_translations; `fields`
// are the translatable columns (base columns stay English). Only human-readable
// text lives here — colours, icons, times, prices, ids are never translated.
//
// `singleton: true` marks single-row tables (id is always 1); their translation
// rows use entityId '1'.
//
// NOTE: menu_template_item is intentionally NOT listed here. Template items are
// an internal, deterministic home for menu-item translations so they survive
// menu-template apply (which recreates menu_items with fresh ids). See
// lib/actions/menu-templates.ts + lib/translations.ts (copyTranslationsBatch).
export const TRANSLATABLE_ENTITIES = {
  hotel_info: {
    label: 'Hotel Information',
    singleton: true,
    fields: ['cancellationPolicy', 'aboutText'],
  },
  beach_pools_info: {
    label: 'Beach & Pools',
    singleton: true,
    fields: [
      'beachDescription',
      'beachNotes',
      'mainPoolDescription',
      'indoorPoolDescription',
      'kidsPoolDescription',
      'generalNotes',
    ],
  },
  spa_service: {
    label: 'Spa Services',
    fields: ['name', 'description', 'tags'],
  },
  wellness_service: {
    label: 'Wellness Services',
    fields: ['name', 'description'],
  },
  restaurant: {
    label: 'Restaurants',
    fields: ['name', 'cuisine', 'description'],
  },
  menu_item: {
    label: 'Menu Items',
    fields: ['name', 'description'],
  },
  room_service_item: {
    label: 'Room Service Items',
    fields: ['name', 'description'],
  },
  event: {
    label: 'Events',
    fields: ['title', 'description', 'location'],
  },
  nearby_guide_item: {
    label: 'Nearby Guide',
    fields: ['name', 'note', 'distance', 'eta'],
  },
  kids_service: {
    label: 'Kids Care — Services',
    fields: ['title', 'description'],
  },
  kids_service_item: {
    label: 'Kids Care — Service Details',
    fields: ['trigger', 'content'],
  },
  kids_activity: {
    label: 'Kids Care — Activities',
    fields: ['event'],
  },
  menu_category: {
    label: 'Menu Categories',
    fields: ['label'],
  },
  allergen: {
    label: 'Allergens',
    fields: ['label'],
  },
} as const

export type TranslatableEntityType = keyof typeof TRANSLATABLE_ENTITIES

/** entityType used internally to persist menu-item translations on a template. */
export const MENU_TEMPLATE_ITEM_ENTITY = 'menu_template_item'
