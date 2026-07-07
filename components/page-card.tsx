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
            <div className='flex flex-col gap-3 p-4 h-full border rounded-3xl bg-card hover:bg-accent/50 transition-colors'>
                <Icon className='text-sky-500 dark:text-sky-400' />
                <div className='flex flex-col gap-1'>
                    <h1 className='font-bold'>{title}</h1>
                    <p className='text-sm font-normal text-muted-foreground'>{description}</p>
                </div>
            </div>
        </Link>
    );
}