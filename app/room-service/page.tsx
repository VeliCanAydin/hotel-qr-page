'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceItemCard } from '@/components/room-service/ServiceItemCard';
import { roomServiceItems, categoryLabels, type RoomServiceItem } from '@/lib/data/roomServiceData';

export default function RoomService() {
    const categories = ['food', 'beverages', 'other-services'] as const;

    const getItemsByCategory = (category: RoomServiceItem['category']) => {
        return roomServiceItems.filter(item => item.category === category);
    };

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-4">Room Service</h2>
            <p className="text-muted-foreground mb-6">
                Order food, beverages, and request services to your room.
            </p>

            <Tabs defaultValue="food" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                            {categoryLabels[category]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <div className="space-y-0">
                            {getItemsByCategory(category).map((item, index, array) => (
                                <ServiceItemCard
                                    key={item.id}
                                    item={item}
                                    showSeparator={index !== array.length - 1}
                                />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
