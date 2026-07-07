import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceItemCard } from '@/components/room-service/service-item-card'
import { categoryLabels, type RoomServiceItem } from '@/lib/types/room-service'
import { db } from '@/lib/db'
import { roomServiceItems } from '@/lib/db/schema'

const CATEGORIES = ['food', 'beverages', 'other-services'] as const

export default async function RoomService() {
  const items = await db.select().from(roomServiceItems)

  const getByCategory = (category: string) =>
    items.filter((item) => item.category === category)

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Room Service</h2>
      <p className="text-muted-foreground mb-6">
        Order food, beverages, and request services to your room.
      </p>

      <Tabs defaultValue="food" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
              {categoryLabels[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="space-y-0">
              {getByCategory(category).map((item, index, array) => (
                <ServiceItemCard
                  key={item.id}
                  item={item as RoomServiceItem}
                  showSeparator={index !== array.length - 1}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
