'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, LogIn } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Cart() {
    const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
    const [note, setNote] = useState('');
    const [isLoggedIn] = useState(false); // Simulated login state

    const handlePlaceOrder = () => {
        // In a real app, this would submit the order to a backend
        alert('Order placed successfully!');
        clearCart();
        setNote('');
    };

    if (items.length === 0) {
        return (
            <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6 text-center">
                    Add items from the room service menu to get started.
                </p>
                <Link href="/room-service">
                    <Button>Browse Room Service</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-4">Your Cart</h2>
            <p className="text-muted-foreground mb-6">
                Review your items before placing your order.
            </p>

            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.id} className="py-4">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)} each`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <span className="font-semibold">
                                    {item.price === 0 ? 'Free' : `$${(item.price * item.quantity).toFixed(2)}`}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Separator className="my-6" />

            <Card className="py-4">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Order Note</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <Textarea
                        placeholder="Add any special instructions or requests for your order..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                    />
                </CardContent>
            </Card>

            <Card className="mt-4 py-4">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    {isLoggedIn ? (
                        <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                            Place Order
                        </Button>
                    ) : (
                        <Button className="w-full" size="lg" variant="secondary">
                            <LogIn className="h-4 w-4 mr-2" />
                            Log in to place an order
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}