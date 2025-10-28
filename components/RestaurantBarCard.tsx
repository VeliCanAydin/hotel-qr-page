"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Suspense } from "react";

interface RestaurantBarCardInterface {
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
}

export default function RestaurantBarCard({ id: id, src: src, alt: alt, title: title, description: description }: RestaurantBarCardInterface) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isOpen = searchParams.get("menu") === id;

    const handleOpenChange = (open: boolean) => {
        if (open) {
            router.push(`?menu=${id}`, { scroll: false });
        } else {
            router.push(`/restaurant-bar`, { scroll: false });
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
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
                    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button variant="default" className="rounded-3xl font-bold px-5">View Menu</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{title}</DialogTitle>
                            </DialogHeader>
                            <DialogDescription className="mt-4 mb-6">
                                {description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="default" className="rounded-3xl font-bold px-5">Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="rounded-3xl font-bold px-5">Make a Reservation</Button>
                </div>
            </div>
        </Suspense>
    );
}