export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { menuItems } from '@/lib/db/schema'
import { type MenuItem } from '@/lib/data/aLaCarteMenu'
import RestaurantClient from './restaurant-client'

export default async function RestaurantPage() {
  const items = await db.select().from(menuItems)
  const typed: MenuItem[] = items.map((item) => ({
    ...item,
    category: item.category as MenuItem['category'],
  }))
  return <RestaurantClient initialMenuData={typed} />
}
