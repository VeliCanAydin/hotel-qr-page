'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import type { RoomServiceItem } from '@/lib/data/roomServiceData';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';

interface ServiceItemCardProps {
    item: RoomServiceItem;
    showSeparator?: boolean;
}

export function ServiceItemCard({ item, showSeparator = true }: ServiceItemCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(item);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

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
                <div className="flex items-center">
                    <Button
                        size="sm"
                        variant={isAdded ? "default" : "outline"}
                        onClick={handleAddToCart}
                        className="shrink-0"
                    >
                        {isAdded ? (
                            <>
                                <Check className="h-4 w-4 mr-1" />
                                Added
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </>
                        )}
                    </Button>
                </div>
            </div>
            {showSeparator && <Separator />}
        </>
    );
}
