"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MenuItem } from "@/lib/data/aLaCarteMenu";

interface MenuItemCardProps {
    item: MenuItem;
    showSeparator?: boolean;
}

export function MenuItemCard({ item, showSeparator = true }: MenuItemCardProps) {
    return (
        <>
            <div className="flex gap-4 py-4">
                {/* <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                    />
                </div> */}
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <span className="shrink-0 font-semibold text-foreground">
                            ${item.price.toFixed(2)}
                        </span>
                    </div>
                    {item.isVegetarian && (
                        <Badge 
                            variant="outline" 
                            className="w-fit border-green-600 text-green-600 dark:border-green-500 dark:text-green-500 text-[10px] px-1.5 py-0"
                        >
                            VEGETARIAN
                        </Badge>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </div>
            {showSeparator && <Separator />}
        </>
    );
}
