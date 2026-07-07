// Cache tags for guest-facing content. The cached readers in lib/content.ts
// attach these; admin mutations invalidate them with updateTag() so guests see
// edits immediately without every page view hitting the database.
export const CONTENT_TAGS = {
  hotelInfo: 'content:hotel-info',
  restaurants: 'content:restaurants',
  menuItems: 'content:menu-items',
  roomServiceItems: 'content:room-service-items',
  events: 'content:events',
  spaServices: 'content:spa-services',
  wellnessServices: 'content:wellness-services',
  beachPools: 'content:beach-pools',
  kidsCare: 'content:kids-care',
  nearbyGuide: 'content:nearby-guide',
} as const
