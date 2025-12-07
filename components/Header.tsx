'use client';

import { Menu, ArrowLeft, ShoppingCart, CircleUserRound } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ModeToggle } from './ModeToggle';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { getTotalItems } = useCart();

    const isHomePage = pathname === '/';
    const isAIAssistantPage = pathname === '/ai-assistant';
    const isRoomServiceRoute = pathname.startsWith('/room-service');
    const totalItems = getTotalItems();

    const handleBackClick = () => {
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    {!isHomePage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBackClick}
                            aria-label="Geri dön"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}

                    <h1 className="text-lg font-semibold">
                        {isAIAssistantPage ? 'AI Asistan' : 'Dosinia Luxury Hotel'}
                    </h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {isRoomServiceRoute ? (
                        // Room Service sayfalarında cart butonu göster
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/room-service/cart')}
                            aria-label="Cart"
                            className="relative"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <Badge
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                    variant="destructive"
                                >
                                    {totalItems > 99 ? '99+' : totalItems}
                                </Badge>
                            )}
                        </Button>
                    ) : isAIAssistantPage ? (
                        // AI Assistant sayfasındayken menü butonu göster
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Menü"
                            onClick={() => {
                                // Buraya gelecek: Chat geçmişi, ayarlar vb.
                                console.log('AI Assistant menu clicked');
                            }}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/login')}
                            aria-label="Login"
                        >
                            <CircleUserRound />
                        </Button>
                    )}

                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
