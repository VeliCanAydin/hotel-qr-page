"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ArtisticGallery from "@/components/beach-pools/ArtisticGallery";

const beachImages = [
    {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop",
        alt: "Beautiful beach with crystal clear water",
    },
    {
        src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=800&fit=crop",
        alt: "Beach loungers and umbrellas",
    },
    {
        src: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&h=800&fit=crop",
        alt: "Tropical beach paradise",
    },
    {
        src: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&h=800&fit=crop",
        alt: "Sunset at the beach",
    },
];

const poolImages = [
    {
        src: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&h=800&fit=crop",
        alt: "Luxury resort pool",
    },
    {
        src: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=1200&h=800&fit=crop",
        alt: "Infinity pool with ocean view",
    },
    {
        src: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1200&h=800&fit=crop",
        alt: "Pool area with palm trees",
    },
];

const pools = [
    {
        name: "Main Pool",
        description: "Our largest pool featuring a swim-up bar and spacious sunbathing areas.",
        size: "1,200 m²",
        depth: "1.2m - 1.8m",
    },
    {
        name: "Relax Pool",
        description: "Adults-only heated pool for a tranquil swimming experience.",
        size: "400 m²",
        depth: "1.4m",
    },
    {
        name: "Kids Pool",
        description: "Safe and fun pool area designed specifically for our younger guests.",
        size: "200 m²",
        depth: "0.3m - 0.6m",
    },
];

// Gallery images - 24 photos for the artistic gallery
const galleryImages = [
    // Sayısal isimlendirilmiş dosyalar
    { src: "/575095538_18372313171156394_5179972881440193234_n.jpeg", alt: "Resort social media photo 1" },
    { src: "/582755746_18374053246156394_6228755626112007029_n.jpeg", alt: "Resort social media photo 2" },
    { src: "/588773685_18374833636156394_6943793457544007078_n.jpeg", alt: "Resort social media photo 3" },

    // DJI ve Genel Görünümler
    { src: "/DJI_0712.jpeg", alt: "Aerial drone view of the resort" },
    { src: "/dosinia_luxury_resort_beach_building.jpeg", alt: "Luxury resort beach building view" },

    // Dosinia - Havuz ve Relax Alanları
    { src: "/dosinia_luxury_resort_beach_relax_pool_3.jpeg", alt: "Relax pool near the beach area" },
    { src: "/dosinia_luxury_resort_beach_relax_pool.jpeg", alt: "Serene beach relax pool" },
    { src: "/dosinia_luxury_resort_main_building_front_view_main_pool.jpeg", alt: "Main building front view with pool" },
    { src: "/dosinia_luxury_resort_main_building_side_view_relax_pool.jpeg", alt: "Side view of main building and relax pool" },

    // Dosinia - Ana Havuzlar
    { src: "/dosinia_luxury_resort_main_pool_2.jpeg", alt: "Main swimming pool view 2" },
    { src: "/dosinia_luxury_resort_main_pool_3.jpeg", alt: "Main swimming pool view 3" },
    { src: "/dosinia_luxury_resort_main_pool_6.jpeg", alt: "Main swimming pool view 6" },
    { src: "/dosinia_luxury_resort_main_pool_7.jpeg", alt: "Main swimming pool view 7" },

    // Dosinia - Diğer Havuzlar ve Swim-up Odalar
    { src: "/dosinia_luxury_resort_relax_pool_4.jpeg", alt: "Relax pool area view 4" },
    { src: "/dosinia_luxury_resort_relax_pool_swim_up_rooms.jpeg", alt: "Swim-up rooms connecting to relax pool" },
    { src: "/dosinia_luxury_resort_swimup_and_relax_pools_3.jpeg", alt: "Swim-up and relax pools intersection" },
    { src: "/dosinia_luxury_resort_swimup_bird_eye_3.jpeg", alt: "Bird's eye view of swim-up pool" },
    { src: "/dosinia_luxury_resort_swimup_pool.png", alt: "Swim-up pool overview" }, // Dikkat: Bu dosya .png uzantılı
    { src: "/dosinia_luxury_resort_swimup_relax_pools_and_garden_building.jpeg", alt: "Garden building with swim-up and relax pools" },

    // EVG Kodlu (Muhtemelen Etkinlik/Mekan) Fotoğrafları
    { src: "/EVG02802-e1725611418337.jpeg", alt: "Resort event or facility detail 1" },
    { src: "/EVG02862-e1725611444365.jpeg", alt: "Resort event or facility detail 2" },
    { src: "/EVG03060-e1725611459196.jpeg", alt: "Resort event or facility detail 3" },
    { src: "/EVG03293-e1725611480586.jpeg", alt: "Resort event or facility detail 4" },
    { src: "/EVG03301-e1725611497344.jpeg", alt: "Resort event or facility detail 5" },
    { src: "/EVG03403-e1725611513157.jpeg", alt: "Resort event or facility detail 6" },

    // Diğer
    { src: "/plaj.jpeg", alt: "Beautiful sandy beach view" },
];

export default function BeachPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <Image
                    src="/plaj.jpeg"
                    alt="Beach & Pools Hero"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <Badge variant="secondary" className="mb-4 text-sm">
                        Relax & Refresh
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                        Beach & Pools
                    </h1>
                </div>
            </section>

            {/* Introduction */}
            <section className="py-12 px-4 max-w-4xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                    Your Paradise Awaits
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    The beach and pools of our hotel offer peace and fun together while you enjoy the sun. An ideal environment awaits you for a holiday full of both rest and water activities.
                </p>
            </section>

            <Separator className="max-w-4xl mx-auto" />

            {/* Beach Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <Badge className="mb-2">Beach</Badge>
                        <h2 className="text-2xl md:text-3xl font-semibold">
                            Private Beach
                        </h2>
                    </div>

                    <Carousel className="w-full max-w-4xl mx-auto">
                        <CarouselContent>
                            {beachImages.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-video rounded-xl overflow-hidden">
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>

                    <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
                        Sink your toes into the soft sand and let the crystal-clear waters
                        of the Mediterranean wash your worries away. Our private beach offers
                        the ultimate escape.
                    </p>
                </div>
            </section>
            <Separator className="max-w-4xl mx-auto" />

            {/* Pools Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <Badge className="mb-2">Pools</Badge>
                        <h2 className="text-2xl md:text-3xl font-semibold">
                            Pools
                        </h2>
                    </div>

                    <Carousel className="w-full max-w-4xl mx-auto">
                        <CarouselContent>
                            {poolImages.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-video rounded-xl overflow-hidden">
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>

                    <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
                        Dive into our luxurious pools, designed for relaxation and enjoyment.
                        Whether you're looking to swim laps or lounge by the water, our pools
                        provide the perfect setting.
                    </p>
                </div>
            </section>

            <Separator className="max-w-4xl mx-auto" />

            {/* Gallery Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <Badge className="mb-2">
                            <Camera className="w-3 h-3 mr-1" />
                            Gallery
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                            Capture the Moments
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Explore our beautiful beach and pool areas through these stunning photos.
                            <span className="hidden md:inline"> Click on any image to view it in full size, or press and hold for a quick preview.</span>
                            <span className="md:hidden"> Tap to view full size, or press and hold for a quick preview.</span>
                        </p>
                    </div>
                </div>

                <ArtisticGallery images={galleryImages} />
            </section>

        </div>
    );
}