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
import { Clock, Utensils, Phone, MessageCircleMore } from "lucide-react";

interface RestaurantCardProps {
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
    hasReservation?: boolean;
    openingHours?: string;
    cuisine?: string;
    highlights?: string[];
    contactPhone?: string;
    contactWhatsapp?: string;
}

export default function RestaurantCard({
    id,
    src,
    alt,
    title,
    description,
    hasReservation = false,
    openingHours = "12:00 - 22:00",
    cuisine = "International Cuisine",
    highlights = ["Fresh ingredients", "Seasonal menu", "Vegetarian options available"],
    contactPhone,
    contactWhatsapp,
}: RestaurantCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const router = useRouter();
    const t = useTranslations("restaurantCard");

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
                            {/* Opening Hours */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{t("openingHours")}</p>
                                    <p className="text-sm text-muted-foreground">{openingHours}</p>
                                </div>
                            </div>

                            {/* Cuisine Type */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                <Utensils className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{t("cuisine")}</p>
                                    <p className="text-sm text-muted-foreground">{cuisine}</p>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">{t("highlights")}</p>
                                <ul className="space-y-1">
                                    {highlights.map((highlight, index) => (
                                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button
                                className="rounded-3xl font-bold"
                                onClick={() => {
                                    setIsDetailsOpen(false);
                                    setTimeout(() => router.push(`/restaurants/${id}`), 300);
                                }}
                            >
                                {t("viewMenu")}
                            </Button>
                            {hasReservation && (
                                <Button
                                    variant="outline"
                                    className="rounded-3xl font-bold"
                                    onClick={() => setIsReservationOpen(true)}
                                >
                                    {t("makeReservation")}
                                </Button>
                            )}
                            <DrawerClose asChild>
                                <Button variant="ghost" className="rounded-3xl">
                                    {t("close")}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                {/* Reservation Drawer */}
                <Drawer open={isReservationOpen} onOpenChange={setIsReservationOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{t("reserveTitle", { name: title })}</DrawerTitle>
                            <DrawerDescription>
                                {t("reserveDesc")}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 space-y-3">
                            {contactPhone && (
                                <a href={`tel:${contactPhone.replace(/\D/g, "")}`} className="block">
                                    <Button className="w-full rounded-3xl font-bold">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {t("callReception", { phone: contactPhone })}
                                    </Button>
                                </a>
                            )}
                            {contactWhatsapp && (
                                <a
                                    href={`https://api.whatsapp.com/send/?phone=${contactWhatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(t("whatsappText", { name: title }))}&type=phone_number&app_absent=0`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button variant="outline" className="w-full rounded-3xl font-bold">
                                        <MessageCircleMore className="h-4 w-4 mr-2" />
                                        {t("messageWhatsapp")}
                                    </Button>
                                </a>
                            )}
                            {!contactPhone && !contactWhatsapp && (
                                <p className="text-sm text-muted-foreground text-center">
                                    {t("visitReception")}
                                </p>
                            )}
                        </div>
                        <DrawerFooter>
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