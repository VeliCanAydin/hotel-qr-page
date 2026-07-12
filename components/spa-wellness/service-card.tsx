'use client';

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageOff, Phone, MessageCircleMore } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ServiceCardProps = {
    data: {
        image: string;
        imageAlt: string;
        title: string;
        description: string;
        hours: string;
        isPaid: boolean;
        reservationRequired: boolean;
        badges?: string[];
    };
    contactPhone?: string;
    contactWhatsapp?: string;
};

export default function ServiceCard({ data, contactPhone, contactWhatsapp }: ServiceCardProps) {
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const t = useTranslations("serviceCard");
    
    return (
        <div className="overflow-hidden">
            {/* Image Section */}
            <div className="relative w-full h-[200px] rounded-tl-3xl rounded-tr-3xl overflow-hidden bg-muted">
                {data.image ? (
                    <Image
                        src={data.image}
                        alt={data.imageAlt}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-8" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-4 gap-3 border rounded-bl-3xl rounded-br-3xl">
                <h1 className="font-bold text-lg">{data.title}</h1>
                <p className="text-muted-foreground">{data.description}</p>
                
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="default" className="rounded-3xl font-bold px-5">
                            {t("details")}
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{t("detailsTitle", { title: data.title })}</DrawerTitle>
                            <DrawerDescription>
                                {data.description}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-6 pb-2 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{t("hours")}</span>
                                <span className="text-sm text-muted-foreground">{data.hours}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{t("pricing")}</span>
                                <span className="text-sm text-muted-foreground">{data.isPaid ? t("paid") : t("free")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{t("reservation")}</span>
                                <span className="text-sm text-muted-foreground">{data.reservationRequired ? t("reservationRequired") : t("noReservation")}</span>
                            </div>
                            {data.badges && data.badges.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {data.badges.map((badge) => (
                                        <Badge key={badge} variant="secondary" className="rounded-full">
                                            {badge}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <DrawerFooter className="flex flex-col sm:flex-row gap-2">
                            {data.reservationRequired && (
                                <Button
                                    variant="default"
                                    className="w-full sm:flex-1 rounded-3xl font-bold"
                                    onClick={() => setIsReservationOpen(true)}
                                >
                                    {t("makeReservation")}
                                </Button>
                            )}
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full sm:flex-1 rounded-3xl">
                                    {t("cancel")}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                {/* Reservation Drawer */}
                <Drawer open={isReservationOpen} onOpenChange={setIsReservationOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{t("reserveTitle", { name: data.title })}</DrawerTitle>
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
                                    href={`https://api.whatsapp.com/send/?phone=${contactWhatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(t("whatsappText", { name: data.title }))}&type=phone_number&app_absent=0`}
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
                                    {t("cancel")}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}
