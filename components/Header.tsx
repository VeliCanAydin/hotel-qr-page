'use client';

import { Menu, ArrowLeft, MessageSquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ModeToggle } from './ModeToggle';
import { Button } from '@/components/ui/button';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const isHomePage = pathname === '/';
    const isAIAssistantPage = pathname === '/ai-assistant';

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
                    {isAIAssistantPage ? (
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
                        // Diğer sayfalarda AI Assistant'a git butonu
                        !isHomePage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/ai-assistant')}
                                aria-label="AI Asistan"
                            >
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        )
                    )}

                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
