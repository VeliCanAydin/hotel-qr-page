"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
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
import { Clock, Utensils } from "lucide-react";

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
    highlights = ["Fresh ingredients", "Seasonal menu", "Vegetarian options available"]
}: RestaurantCardProps) {
    const [isReservationOpen, setIsReservationOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 pb-4">
            <div className="relative w-full h-[200px] rounded-3xl overflow-hidden">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-base font-normal text-[#887C63]">{description}</p>
            <div className="flex flex-row gap-3">
                <Drawer>
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
                            <Button asChild className="rounded-3xl font-bold">
                                <Link href={`/restaurants/${id}`}>View Menu</Link>
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
                                Fill in the details below to make a reservation.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor={`name-${id}`} className="text-sm font-medium">
                                    Name
                                </label>
                                <input
                                    id={`name-${id}`}
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`room-${id}`} className="text-sm font-medium">
                                    Room Number
                                </label>
                                <input
                                    id={`room-${id}`}
                                    type="text"
                                    placeholder="e.g., 101"
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`guests-${id}`} className="text-sm font-medium">
                                    Number of Guests
                                </label>
                                <input
                                    id={`guests-${id}`}
                                    type="number"
                                    min="1"
                                    max="20"
                                    placeholder="2"
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`date-${id}`} className="text-sm font-medium">
                                    Date
                                </label>
                                <input
                                    id={`date-${id}`}
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`time-${id}`} className="text-sm font-medium">
                                    Preferred Time
                                </label>
                                <input
                                    id={`time-${id}`}
                                    type="time"
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`notes-${id}`} className="text-sm font-medium">
                                    Special Requests (optional)
                                </label>
                                <textarea
                                    id={`notes-${id}`}
                                    placeholder="Any dietary requirements or special requests..."
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md bg-background resize-none"
                                />
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button className="rounded-3xl font-bold">
                                Confirm Reservation
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-3xl"
                                onClick={() => setIsReservationOpen(false)}
                            >
                                Cancel
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}