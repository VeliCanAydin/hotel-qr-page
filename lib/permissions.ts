export type AdminPagePermission = {
  href: string
  key: string
  label: string
  section: string
  description: string
}

export const ADMIN_PAGE_PERMISSIONS: AdminPagePermission[] = [
  {
    href: '/dashboard',
    key: 'dashboard',
    label: 'Dashboard',
    section: 'Core',
    description: 'Home metrics, quick links and operational overview.',
  },
  {
    href: '/dashboard/content',
    key: 'content-overview',
    label: 'Content Overview',
    section: 'Content',
    description: 'Central hub for managing all guest-facing content.',
  },
  {
    href: '/dashboard/content/hotel-info',
    key: 'hotel-info',
    label: 'Hotel Info',
    section: 'Content',
    description: 'Phone, Wi-Fi and policy content for guests.',
  },
  {
    href: '/dashboard/content/kids-care',
    key: 'kids-care',
    label: 'Kids Care',
    section: 'Content',
    description: 'Kids club services, benefits and schedules.',
  },
  {
    href: '/dashboard/content/nearby-guide',
    key: 'nearby-guide',
    label: 'Nearby Guide',
    section: 'Content',
    description: 'Nearby essentials and tourist attraction listings.',
  },
  {
    href: '/dashboard/content/beach-pools',
    key: 'beach-pools',
    label: 'Beach & Pools',
    section: 'Content',
    description: 'Beach and pool information shown to guests.',
  },
  {
    href: '/dashboard/content/spa',
    key: 'spa',
    label: 'Spa',
    section: 'Content',
    description: 'Spa services, pricing and reservation rules.',
  },
  {
    href: '/dashboard/content/wellness',
    key: 'wellness',
    label: 'Wellness',
    section: 'Content',
    description: 'Fitness and activity content for the guest portal.',
  },
  {
    href: '/dashboard/content/translations',
    key: 'translations',
    label: 'Translations',
    section: 'Content',
    description: 'Guest-facing content translations for every supported language.',
  },
  {
    href: '/dashboard/services/restaurant',
    key: 'restaurant',
    label: 'Restaurant Menu',
    section: 'Services',
    description: 'A-la-carte and restaurant menu content.',
  },
  {
    href: '/dashboard/services/room-service',
    key: 'room-service',
    label: 'Room Service',
    section: 'Services',
    description: 'In-room service catalog and pricing.',
  },
  {
    href: '/dashboard/orders/room-service-orders',
    key: 'room-service-orders',
    label: 'Room Service Orders',
    section: 'Operations',
    description: 'Guest orders and fulfillment workflow.',
  },
  {
    href: '/dashboard/events/list',
    key: 'events',
    label: 'Events',
    section: 'Operations',
    description: 'Hotel events and schedule management.',
  },
  {
    href: '/dashboard/guests/list',
    key: 'guests',
    label: 'Guest List',
    section: 'Operations',
    description: 'Guest profiles and operational guest records.',
  },
  {
    href: '/dashboard/guests/feedback',
    key: 'guest-feedback',
    label: 'Guest Feedback',
    section: 'Operations',
    description: 'Daily guest ratings, review notes and follow-up tracking.',
  },
  {
    href: '/dashboard/guests/support-requests',
    key: 'support-requests',
    label: 'Support Requests',
    section: 'Operations',
    description: 'Guest support requests and complaint follow-up.',
  },
  {
    href: '/dashboard/settings/access-control',
    key: 'access-control',
    label: 'Access Control',
    section: 'Administration',
    description: 'Staff roles and dashboard page permissions.',
  },
]

export type AdminRolePreset = {
  name: string
  description: string
  allowedPageKeys: string[]
  isSystem: boolean
}

export const DEFAULT_ADMIN_ROLE_PRESETS: AdminRolePreset[] = [
  {
    name: 'Super Admin',
    description: 'Full access to every dashboard page and staff permission.',
    allowedPageKeys: ADMIN_PAGE_PERMISSIONS.map((page) => page.href),
    isSystem: true,
  },
  {
    name: 'Content Manager',
    description: 'Maintains guest-facing content and media pages.',
    allowedPageKeys: [
      '/dashboard',
      '/dashboard/content',
      '/dashboard/content/hotel-info',
      '/dashboard/content/kids-care',
      '/dashboard/content/nearby-guide',
      '/dashboard/content/beach-pools',
      '/dashboard/content/spa',
      '/dashboard/content/wellness',
      '/dashboard/content/translations',
    ],
    isSystem: true,
  },
  {
    name: 'Service Manager',
    description: 'Manages room service, menus and order operations.',
    allowedPageKeys: [
      '/dashboard',
      '/dashboard/services/restaurant',
      '/dashboard/services/room-service',
      '/dashboard/orders/room-service-orders',
    ],
    isSystem: true,
  },
  {
    name: 'Guest Relations',
    description: 'Handles guest records, events and operational follow-up.',
    allowedPageKeys: [
      '/dashboard',
      '/dashboard/events/list',
      '/dashboard/guests/list',
      '/dashboard/guests/feedback',
      '/dashboard/guests/support-requests',
    ],
    isSystem: true,
  },
]

export function getAdminPageByHref(pathname: string) {
  return [...ADMIN_PAGE_PERMISSIONS]
    .sort((left, right) => right.href.length - left.href.length)
    .find((page) => pathname === page.href || pathname.startsWith(`${page.href}/`))
}

export function getRolePreset(roleName: string) {
  return DEFAULT_ADMIN_ROLE_PRESETS.find((preset) => preset.name === roleName)
}

export function isDashboardPathAllowed(pathname: string, roleName: string) {
  const rolePreset = getRolePreset(roleName)

  if (!rolePreset) {
    return false
  }

  // Resolve the pathname to its owning page first, then require an exact
  // grant. A plain prefix check would make the '/dashboard' entry every
  // preset contains match *all* dashboard pages (fail open).
  const page = getAdminPageByHref(pathname)
  if (!page) {
    return false
  }

  return rolePreset.allowedPageKeys.includes(page.href)
}