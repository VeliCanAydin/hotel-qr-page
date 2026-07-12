"use client"
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Clock } from "lucide-react";

interface BarCardProps {
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
    openingHours: string;
    highlights: string[];
}

export default function BarCard({
    id,
    src,
    alt,
    title,
    description,
    openingHours,
    highlights,
}: BarCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const router = useRouter();
    const t = useTranslations("barCard");

    return (
        <div className="flex flex-col gap-4 pb-4">
            <div className="relative w-full h-[200px] rounded-3xl overflow-hidden">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    loading="eager"
                />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-base font-normal text-muted-foreground">{description}</p>
            <div className="flex flex-row gap-3">
                <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DrawerTrigger asChild>
                        <Button variant="default" className="rounded-3xl font-bold px-5">
                            {t("details")}
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{title}</DrawerTitle>
                            <DrawerDescription>
                                {description}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{t("openingHours")}</p>
                                    <p className="text-sm text-muted-foreground">{openingHours}</p>
                                </div>
                            </div>

                            {highlights.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{t("highlights")}</p>
                                    <ul className="space-y-1">
                                        {highlights.map((highlight) => (
                                            <li key={highlight} className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <DrawerFooter>
                            <Button
                                className="rounded-3xl font-bold"
                                onClick={() => {
                                    setIsDetailsOpen(false);
                                    setTimeout(() => router.push(`/bars/${id}`), 300);
                                }}
                            >
                                {t("viewPage")}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="ghost" className="rounded-3xl">
                                    {t("close")}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}
