import { LucideIcon } from "lucide-react";

interface BenefitsInterface {
    icon: LucideIcon;
    title: string;
    content: string;
}


export default function Benefits({ icon: Icon, title, content}: BenefitsInterface) {
    return (
        <div className="flex flex-col gap-1 p-4 align-items-center text-center bg-accent/40 rounded-2xl border border-gray-200">
            <Icon className="mx-auto text-gray-500" />
            <h2 className="text-sm font-bold">{title}</h2>
            <p className="text-xs text-stone-400"> {content} </p>
        </div>
    );
}