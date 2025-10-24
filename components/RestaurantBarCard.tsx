import { Button } from "@/components/ui/button";
import Image from "next/image";

interface RestaurantBarCardInterface {
    src: string;
    alt: string;
    title: string;
    description: string;
}

export default function RestaurantBarCard({ src: src, alt: alt, title: title, description: description }: RestaurantBarCardInterface) {
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
                <Button variant="default" className="rounded-3xl font-bold px-5">View Menu</Button>
                <Button variant="outline" className="rounded-3xl font-bold px-5">Make a Reservation</Button>
            </div>
        </div>
    );
}