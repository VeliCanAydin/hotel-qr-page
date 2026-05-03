export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { menuItems, menuItemImages } from '@/lib/db/schema'
import { type MenuItem, categories as staticCategories } from '@/lib/data/aLaCarteMenu'
import { getMenuCategories } from '@/lib/actions/menu-items'
import { eq } from 'drizzle-orm'
import RestaurantClient from './restaurant-client'

export default async function RestaurantPage() {
  const [rows, images, dbCategories] = await Promise.all([
    db.select().from(menuItems),
    db.select().from(menuItemImages),
    getMenuCategories().catch(() => []),
  ])

  const imageMap = Object.fromEntries(images.map((i) => [i.itemId, i.proxyUrl]))

  const typed: MenuItem[] = rows.map((item) => ({
    ...item,
    image: imageMap[item.id],
  }))

  const allCategories = [
    ...staticCategories,
    ...dbCategories.filter((c) => !staticCategories.some((s) => s.id === c.id)),
  ]

  return <RestaurantClient initialMenuData={typed} initialCategories={allCategories} />
}
