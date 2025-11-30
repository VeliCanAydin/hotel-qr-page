"use client"
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

interface RestaurantCardProps {
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
    hasReservation?: boolean;
}

export default function RestaurantCard({ 
    id, 
    src, 
    alt, 
    title, 
    description, 
    hasReservation = false 
}: RestaurantCardProps) {
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
                <Button asChild variant="default" className="rounded-3xl font-bold px-5">
                    <Link href={`/restaurants/${id}`}>View Menu</Link>
                </Button>
                
                {hasReservation && (
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="outline" className="rounded-3xl font-bold px-5">
                                Make a Reservation
                            </Button>
                        </DrawerTrigger>
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
                                <DrawerClose asChild>
                                    <Button variant="outline" className="rounded-3xl">
                                        Cancel
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                )}
            </div>
        </div>
    );
}