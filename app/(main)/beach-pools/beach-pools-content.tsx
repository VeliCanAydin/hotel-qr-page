import Image from "next/image"
import { Camera } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ArtisticGallery from "@/components/beach-pools/artistic-gallery"
import type { BeachPoolsInfoData } from "@/lib/actions/beach-pools"

const beachImages = [
  {
    src: "/dosinia_luxury_resort_beach_building.jpeg",
    alt: "Dosinia beach building by the shore",
  },
  {
    src: "/dosinia_luxury_resort_beach_relax_pool.jpeg",
    alt: "Relax pool right next to the beach",
  },
  {
    src: "/dosinia_luxury_resort_beach_relax_pool_3.jpeg",
    alt: "Beach area with loungers and relax pool",
  },
  {
    src: "/DJI_0712.jpeg",
    alt: "Aerial view of the resort and beachfront",
  },
]

const poolImages = [
  {
    src: "/dosinia_luxury_resort_main_pool_2.jpeg",
    alt: "Main swimming pool",
  },
  {
    src: "/dosinia_luxury_resort_swimup_pool.png",
    alt: "Swim-up pool by the garden rooms",
  },
  {
    src: "/dosinia_luxury_resort_relax_pool_4.jpeg",
    alt: "Relax pool area",
  },
]

const galleryImages = [
  { src: "/575095538_18372313171156394_5179972881440193234_n.jpeg", alt: "Resort social media photo 1" },
  { src: "/582755746_18374053246156394_6228755626112007029_n.jpeg", alt: "Resort social media photo 2" },
  { src: "/588773685_18374833636156394_6943793457544007078_n.jpeg", alt: "Resort social media photo 3" },
  { src: "/DJI_0712.jpeg", alt: "Aerial drone view of the resort" },
  { src: "/dosinia_luxury_resort_beach_building.jpeg", alt: "Luxury resort beach building view" },
  { src: "/dosinia_luxury_resort_beach_relax_pool_3.jpeg", alt: "Relax pool near the beach area" },
  { src: "/dosinia_luxury_resort_beach_relax_pool.jpeg", alt: "Serene beach relax pool" },
  { src: "/dosinia_luxury_resort_main_building_front_view_main_pool.jpeg", alt: "Main building front view with pool" },
  { src: "/dosinia_luxury_resort_main_building_side_view_relax_pool.jpeg", alt: "Side view of main building and relax pool" },
  { src: "/dosinia_luxury_resort_main_pool_2.jpeg", alt: "Main swimming pool view 2" },
  { src: "/dosinia_luxury_resort_main_pool_3.jpeg", alt: "Main swimming pool view 3" },
  { src: "/dosinia_luxury_resort_main_pool_6.jpeg", alt: "Main swimming pool view 6" },
  { src: "/dosinia_luxury_resort_main_pool_7.jpeg", alt: "Main swimming pool view 7" },
  { src: "/dosinia_luxury_resort_relax_pool_4.jpeg", alt: "Relax pool area view 4" },
  { src: "/dosinia_luxury_resort_relax_pool_swim_up_rooms.jpeg", alt: "Swim-up rooms connecting to relax pool" },
  { src: "/dosinia_luxury_resort_swimup_and_relax_pools_3.jpeg", alt: "Swim-up and relax pools intersection" },
  { src: "/dosinia_luxury_resort_swimup_bird_eye_3.jpeg", alt: "Bird's eye view of swim-up pool" },
  { src: "/dosinia_luxury_resort_swimup_pool.png", alt: "Swim-up pool overview" },
  { src: "/dosinia_luxury_resort_swimup_relax_pools_and_garden_building.jpeg", alt: "Garden building with swim-up and relax pools" },
  { src: "/EVG02802-e1725611418337.jpeg", alt: "Resort event or facility detail 1" },
  { src: "/EVG02862-e1725611444365.jpeg", alt: "Resort event or facility detail 2" },
  { src: "/EVG03060-e1725611459196.jpeg", alt: "Resort event or facility detail 3" },
  { src: "/EVG03293-e1725611480586.jpeg", alt: "Resort event or facility detail 4" },
  { src: "/plaj.jpeg", alt: "Beautiful sandy beach view" },
]

function formatHours(open: string | null, close: string | null) {
  if (!open || !close) return null
  return `${open.slice(0, 5)} – ${close.slice(0, 5)}`
}

export default function BeachPoolsContent({ info }: { info: BeachPoolsInfoData }) {
  return (
    <div className="min-h-screen">
      <section className="relative h-[50vh] min-h-100 overflow-hidden">
        <Image
          src="/plaj.jpeg"
          alt="Beach & Pools Hero"
          fill
          className="object-cover"
          loading="eager"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <Badge variant="secondary" className="mb-4 text-sm">
            Relax & Refresh
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Beach & Pools</h1>
        </div>
      </section>

      <section className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Your Paradise Awaits</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The beach and pools of our hotel offer peace and fun together while you enjoy the sun. An
          ideal environment awaits you for a holiday full of both rest and water activities.
        </p>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Beach Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-2">Beach</Badge>
            <h2 className="text-2xl md:text-3xl font-semibold">Private Beach</h2>
            {formatHours(info.beachOpenTime, info.beachCloseTime) && (
              <p className="text-sm text-muted-foreground mt-1">Hours: {formatHours(info.beachOpenTime, info.beachCloseTime)}</p>
            )}
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {beachImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={image.src} alt={image.alt} fill className="object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
            {info.beachDescription ||
              "Sink your toes into the soft sand and let the crystal-clear waters of the Mediterranean wash your worries away. Our private beach offers the ultimate escape."}
          </p>
          {info.beachNotes && (
            <p className="text-center text-muted-foreground text-sm mt-2 max-w-2xl mx-auto">
              {info.beachNotes}
            </p>
          )}
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Pools Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-2">Pools</Badge>
            <h2 className="text-2xl md:text-3xl font-semibold">Pools</h2>
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {poolImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={image.src} alt={image.alt} fill className="object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
            {info.mainPoolDescription ||
              "Dive into our luxurious pools, designed for relaxation and enjoyment. Whether you're looking to swim laps or lounge by the water, our pools provide the perfect setting."}
          </p>

          {/* Pool details grid */}
          {(info.indoorPoolDescription || info.kidsPoolDescription) && (
            <div className="grid sm:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto">
              {info.indoorPoolDescription && (
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Indoor Pool</h3>
                  {formatHours(info.indoorPoolOpenTime, info.indoorPoolCloseTime) && (
                    <p className="text-xs text-muted-foreground mb-2">Hours: {formatHours(info.indoorPoolOpenTime, info.indoorPoolCloseTime)}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{info.indoorPoolDescription}</p>
                </div>
              )}
              {info.kidsPoolDescription && (
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Kids Pool</h3>
                  {formatHours(info.kidsPoolOpenTime, info.kidsPoolCloseTime) && (
                    <p className="text-xs text-muted-foreground mb-2">Hours: {formatHours(info.kidsPoolOpenTime, info.kidsPoolCloseTime)}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{info.kidsPoolDescription}</p>
                </div>
              )}
            </div>
          )}

          {info.generalNotes && (
            <p className="text-center text-muted-foreground text-sm mt-6 max-w-2xl mx-auto italic">
              {info.generalNotes}
            </p>
          )}
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
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Capture the Moments</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our beautiful beach and pool areas through these stunning photos.
              <span className="hidden md:inline">
                {" "}
                Click on any image to view it in full size, or press and hold for a quick preview.
              </span>
              <span className="md:hidden"> Tap to view full size, or press and hold for a quick preview.</span>
            </p>
          </div>
        </div>
        <ArtisticGallery images={galleryImages} />
      </section>
    </div>
  )
}
