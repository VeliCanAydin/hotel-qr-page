'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import type { RoomServiceItem } from '@/lib/types/room-service';
import { Plus, Minus } from 'lucide-react';

interface ServiceItemCardProps {
    item: RoomServiceItem;
    showSeparator?: boolean;
}

export function ServiceItemCard({ item, showSeparator = true }: ServiceItemCardProps) {
    const { items, addToCart, updateQuantity } = useCart();
    const cartItem = items.find((i) => i.id === item.id);
    const quantity = cartItem?.quantity ?? 0;

    return (
        <>
            <div className="flex gap-4 py-4">
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <span className="shrink-0 font-semibold text-foreground">
                            {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                    </p>
                </div>
                <div className="flex items-center shrink-0">
                    {quantity === 0 ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, quantity - 1)}
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-6 text-center text-sm font-semibold tabular-nums">
                                {quantity}
                            </span>
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => addToCart(item)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {showSeparator && <Separator />}
        </>
    );
}
