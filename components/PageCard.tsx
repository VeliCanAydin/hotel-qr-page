import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface PagesInterface {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
}

export default function PageCard({ icon: Icon, title, description, href }: PagesInterface) {
    return (
        <Link href={href} className="h-full">
            <div className='flex flex-col gap-3 p-4 h-full border rounded-3xl hover:bg-gray-50 transition ac'>
                <Icon color='#45a7d7ff' />
                <div className='flex flex-col gap-1'>
                    <h1 className='font-bold'>{title}</h1>
                    <p className='text-sm font-normal text-gray-600'>{description}</p>
                </div>
            </div>
        </Link>
    );
}