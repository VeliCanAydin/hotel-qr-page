'use client';

import { Menu, ArrowLeft, Home, ShoppingCart, CircleUserRound, LayoutDashboard, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ModeToggle } from './mode-toggle';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { guestLogout } from '@/lib/actions/guest-auth';

interface GuestInfo {
    guestName: string;
    roomNumber: string;
}

export default function Header({ guestInfo }: { guestInfo?: GuestInfo }) {
    const pathname = usePathname();
    const router = useRouter();
    const { getTotalItems } = useCart();

    const segments = pathname.split('/').filter(Boolean);
    const isHomePage = segments.length === 0;
    const isFirstLevel = segments.length === 1;
    const isDeepLevel = segments.length >= 2;
    const isAIAssistantPage = pathname === '/ai-assistant';
    const isRoomServiceRoute = pathname.startsWith('/room-service');
    const totalItems = getTotalItems();

    const parentPath = isDeepLevel ? '/' + segments.slice(0, -1).join('/') : '/';

    const handleBackClick = () => router.push(parentPath);
    const handleHomeClick = () => router.push('/');

    const guestInitials = guestInfo
        ? guestInfo.guestName
            .split(' ')
            .filter((w) => /[A-Za-z]/.test(w[0]))
            .map((w) => w[0].toUpperCase())
            .slice(0, 2)
            .join('')
        : '';

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    {isFirstLevel && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleHomeClick}
                            aria-label="Home"
                        >
                            <Home className="h-5 w-5" />
                        </Button>
                    )}
                    {isDeepLevel && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBackClick}
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}

                    <h1 className="text-lg font-semibold">
                        {isAIAssistantPage ? 'AI Assistant' : 'Dosinia Luxury Hotel'}
                    </h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-1">
                    {isRoomServiceRoute && (
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
                    )}

                    {isAIAssistantPage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Menu"
                            onClick={() => {
                                console.log('AI Assistant menu clicked');
                            }}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}

                    {guestInfo ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Guest menu">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-xs">{guestInitials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-sm">{guestInfo.guestName}</span>
                                        <span className="text-xs text-muted-foreground">Room {guestInfo.roomNumber}</span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/portal')} className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    My Stay
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="text-destructive focus:text-destructive cursor-pointer p-0">
                                    <form action={guestLogout}>
                                        <button type="submit" className="flex w-full items-center gap-2 px-2 py-1.5 text-sm">
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
