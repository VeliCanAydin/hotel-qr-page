"use client"
import { useState } from "react";
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
                            Details
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
                                    <p className="text-sm font-medium">Opening Hours</p>
                                    <p className="text-sm text-muted-foreground">{openingHours}</p>
                                </div>
                            </div>

                            {/* Cuisine Type */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                <Utensils className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Cuisine</p>
                                    <p className="text-sm text-muted-foreground">{cuisine}</p>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Highlights</p>
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
                                View Menu
                            </Button>
                            {hasReservation && (
                                <Button
                                    variant="outline"
                                    className="rounded-3xl font-bold"
                                    onClick={() => setIsReservationOpen(true)}
                                >
                                    Make a Reservation
                                </Button>
                            )}
                            <DrawerClose asChild>
                                <Button variant="ghost" className="rounded-3xl">
                                    Close
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                {/* Reservation Drawer */}
                <Drawer open={isReservationOpen} onOpenChange={setIsReservationOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Reserve a Table at {title}</DrawerTitle>
                            <DrawerDescription>
                                Table reservations are handled by our reception team. Reach us by
                                phone or WhatsApp and we&apos;ll arrange it for you.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 space-y-3">
                            {contactPhone && (
                                <a href={`tel:${contactPhone.replace(/\D/g, "")}`} className="block">
                                    <Button className="w-full rounded-3xl font-bold">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Reception — {contactPhone}
                                    </Button>
                                </a>
                            )}
                            {contactWhatsapp && (
                                <a
                                    href={`https://api.whatsapp.com/send/?phone=${contactWhatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(`Hello, I would like to reserve a table at ${title}.`)}&type=phone_number&app_absent=0`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button variant="outline" className="w-full rounded-3xl font-bold">
                                        <MessageCircleMore className="h-4 w-4 mr-2" />
                                        Message on WhatsApp
                                    </Button>
                                </a>
                            )}
                            {!contactPhone && !contactWhatsapp && (
                                <p className="text-sm text-muted-foreground text-center">
                                    Please visit the reception desk to make a reservation.
                                </p>
                            )}
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="ghost" className="rounded-3xl">
                                    Close
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}