"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MenuItemCard } from "@/components/a-la-carte/MenuItemCard";
import { menuItems, categories } from "@/lib/data/aLaCarteMenu";

export default function Breakfast() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 pb-0">
                <h2 className="text-3xl font-bold mb-4">Breakfast</h2>
            </div>

            <Tabs defaultValue="appetizers" className="flex-1 flex flex-col">
                <div className="px-4">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="inline-flex h-auto w-max gap-2 bg-transparent p-0">
                            {categories.map((category) => (
                                <TabsTrigger
                                    key={category.id}
                                    value={category.id}
                                    className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    {category.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" className="invisible" />
                    </ScrollArea>
                </div>

                <div className="flex-1 overflow-auto">
                    {categories.map((category) => (
                        <TabsContent
                            key={category.id}
                            value={category.id}
                            className="mt-0 px-4 pb-4"
                        >
                            <div className="divide-y">
                                {menuItems
                                    .filter((item) => item.category === category.id)
                                    .map((item, index, filteredItems) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            showSeparator={index < filteredItems.length - 1}
                                        />
                                    ))}
                            </div>
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}