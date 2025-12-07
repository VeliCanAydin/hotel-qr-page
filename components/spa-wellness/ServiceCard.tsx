'use client';

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
};

export default function ServiceCard({ data }: ServiceCardProps) {
    return (
        <div className="overflow-hidden">
            {/* Image Section */}
            <div className="relative w-full h-[200px] rounded-tl-3xl rounded-tr-3xl overflow-hidden">
                <Image
                    src={data.image}
                    alt={data.imageAlt}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-4 gap-3 border rounded-bl-3xl rounded-br-3xl">
                <h1 className="font-bold text-lg">{data.title}</h1>
                <p className="text-muted-foreground">{data.description}</p>
                <Drawer>
                    <DrawerTrigger asChild><Button variant="default" className="rounded-3xl font-bold px-5">Details</Button></DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{data.title} details</DrawerTitle>
                            <DrawerDescription>
                                {data.description}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-6 pb-2 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Hours</span>
                                <span className="text-sm text-muted-foreground">{data.hours}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Pricing</span>
                                <span className="text-sm text-muted-foreground">{data.isPaid ? "Paid" : "Free"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Reservation</span>
                                <span className="text-sm text-muted-foreground">{data.reservationRequired ? "Reservation required" : "No reservation needed"}</span>
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
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}
