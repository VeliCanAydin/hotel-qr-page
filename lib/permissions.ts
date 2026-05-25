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

export type TempAdminUser = {
  email: string
  password: string
  roleName: string
  displayName: string
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
      '/dashboard/content/hotel-info',
      '/dashboard/content/kids-care',
      '/dashboard/content/beach-pools',
      '/dashboard/content/spa',
      '/dashboard/content/wellness',
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
    ],
    isSystem: true,
  },
]

export const TEMP_ADMIN_USERS: TempAdminUser[] = [
  {
    email: 'admin@dosinia.com',
    password: 'admin123',
    roleName: 'Super Admin',
    displayName: 'Super Admin',
  },
  {
    email: 'content.manager@dosinia.com',
    password: 'content123!',
    roleName: 'Content Manager',
    displayName: 'Content Manager',
  },
  {
    email: 'service.manager@dosinia.com',
    password: 'service123!',
    roleName: 'Service Manager',
    displayName: 'Service Manager',
  },
]

export function getTempAdminUserByEmail(email: string) {
  return TEMP_ADMIN_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

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

  return rolePreset.allowedPageKeys.some((allowedHref) => pathname === allowedHref || pathname.startsWith(`${allowedHref}/`))
}