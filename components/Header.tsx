'use client';

import { Menu, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const isHomePage = pathname === '/';
    const handleBackClick = () => {
        router.push('/');
    };

    return (
        <header className="flex justify-between m-0 px-4 py-6 text-center content-center">
            {isHomePage ? (
                <Menu size={23} className='inline' />
            ) : (
                <button onClick={handleBackClick} aria-label="Go back">
                    <ArrowLeft size={23} className='inline' />
                </button>
            )}
            <h1 className="text-center text-lg not-italic font-bold leading-[22.5px] tracking-[-0.27px];">
                Dosinia Hotel
            </h1>
            <span className='font-bold leading-[1.5] '>EN</span>
        </header>
    );
}