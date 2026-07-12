import Image from "next/image"
import { getTranslations } from "next-intl/server"
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

// `altKey` resolves to beachPools.alts.* in messages/*.json so alt texts follow the locale
const beachImages = [
  { src: "/dosinia_luxury_resort_beach_building.jpeg", altKey: "beachBuilding" },
  { src: "/dosinia_luxury_resort_beach_relax_pool.jpeg", altKey: "beachRelaxPool" },
  { src: "/dosinia_luxury_resort_beach_relax_pool_3.jpeg", altKey: "beachLoungers" },
  { src: "/DJI_0712.jpeg", altKey: "aerial" },
] as const

const poolImages = [
  { src: "/dosinia_luxury_resort_main_pool_2.jpeg", altKey: "mainPool" },
  { src: "/dosinia_luxury_resort_swimup_pool.png", altKey: "swimUpPool" },
  { src: "/dosinia_luxury_resort_relax_pool_4.jpeg", altKey: "relaxPool" },
] as const

const galleryImages = [
  { src: "/575095538_18372313171156394_5179972881440193234_n.jpeg", altKey: "social" },
  { src: "/582755746_18374053246156394_6228755626112007029_n.jpeg", altKey: "social" },
  { src: "/588773685_18374833636156394_6943793457544007078_n.jpeg", altKey: "social" },
  { src: "/DJI_0712.jpeg", altKey: "aerial" },
  { src: "/dosinia_luxury_resort_beach_building.jpeg", altKey: "beachBuilding" },
  { src: "/dosinia_luxury_resort_beach_relax_pool_3.jpeg", altKey: "beachLoungers" },
  { src: "/dosinia_luxury_resort_beach_relax_pool.jpeg", altKey: "beachRelaxPool" },
  { src: "/dosinia_luxury_resort_main_building_front_view_main_pool.jpeg", altKey: "mainBuildingFront" },
  { src: "/dosinia_luxury_resort_main_building_side_view_relax_pool.jpeg", altKey: "mainBuildingSide" },
  { src: "/dosinia_luxury_resort_main_pool_2.jpeg", altKey: "mainPool" },
  { src: "/dosinia_luxury_resort_main_pool_3.jpeg", altKey: "mainPool" },
  { src: "/dosinia_luxury_resort_main_pool_6.jpeg", altKey: "mainPool" },
  { src: "/dosinia_luxury_resort_main_pool_7.jpeg", altKey: "mainPool" },
  { src: "/dosinia_luxury_resort_relax_pool_4.jpeg", altKey: "relaxPool" },
  { src: "/dosinia_luxury_resort_relax_pool_swim_up_rooms.jpeg", altKey: "swimUpRooms" },
  { src: "/dosinia_luxury_resort_swimup_and_relax_pools_3.jpeg", altKey: "swimUpRelaxPools" },
  { src: "/dosinia_luxury_resort_swimup_bird_eye_3.jpeg", altKey: "swimUpPool" },
  { src: "/dosinia_luxury_resort_swimup_pool.png", altKey: "swimUpPool" },
  { src: "/dosinia_luxury_resort_swimup_relax_pools_and_garden_building.jpeg", altKey: "gardenBuilding" },
  { src: "/EVG02802-e1725611418337.jpeg", altKey: "facility" },
  { src: "/EVG02862-e1725611444365.jpeg", altKey: "facility" },
  { src: "/EVG03060-e1725611459196.jpeg", altKey: "facility" },
  { src: "/EVG03293-e1725611480586.jpeg", altKey: "facility" },
  { src: "/plaj.jpeg", altKey: "sandyBeach" },
] as const

function formatHours(open: string | null, close: string | null) {
  if (!open || !close) return null
  return `${open.slice(0, 5)} – ${close.slice(0, 5)}`
}

export default async function BeachPoolsContent({ info }: { info: BeachPoolsInfoData }) {
  const t = await getTranslations("beachPools")
  return (
    <div className="min-h-screen">
      <section className="relative h-[50vh] min-h-100 overflow-hidden">
        <Image
          src="/plaj.jpeg"
          alt={t("alts.hero")}
          fill
          className="object-cover"
          loading="eager"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <Badge variant="secondary" className="mb-4 text-sm">
            {t("badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t("title")}</h1>
        </div>
      </section>

      <section className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t("paradise")}</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {t("intro")}
        </p>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Beach Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-2">{t("beachBadge")}</Badge>
            <h2 className="text-2xl md:text-3xl font-semibold">{t("privateBeach")}</h2>
            {formatHours(info.beachOpenTime, info.beachCloseTime) && (
              <p className="text-sm text-muted-foreground mt-1">{t("hoursLabel")} {formatHours(info.beachOpenTime, info.beachCloseTime)}</p>
            )}
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {beachImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={image.src} alt={t(`alts.${image.altKey}`)} fill className="object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
            {info.beachDescription || t("beachFallback")}
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
            <Badge className="mb-2">{t("poolsBadge")}</Badge>
            <h2 className="text-2xl md:text-3xl font-semibold">{t("pools")}</h2>
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {poolImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={image.src} alt={t(`alts.${image.altKey}`)} fill className="object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
            {info.mainPoolDescription || t("poolFallback")}
          </p>

          {/* Pool details grid */}
          {(info.indoorPoolDescription || info.kidsPoolDescription) && (
            <div className="grid sm:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto">
              {info.indoorPoolDescription && (
                <div className="text-center">
                  <h3 className="font-semibold mb-1">{t("indoorPool")}</h3>
                  {formatHours(info.indoorPoolOpenTime, info.indoorPoolCloseTime) && (
                    <p className="text-xs text-muted-foreground mb-2">{t("hoursLabel")} {formatHours(info.indoorPoolOpenTime, info.indoorPoolCloseTime)}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{info.indoorPoolDescription}</p>
                </div>
              )}
              {info.kidsPoolDescription && (
                <div className="text-center">
                  <h3 className="font-semibold mb-1">{t("kidsPool")}</h3>
                  {formatHours(info.kidsPoolOpenTime, info.kidsPoolCloseTime) && (
                    <p className="text-xs text-muted-foreground mb-2">{t("hoursLabel")} {formatHours(info.kidsPoolOpenTime, info.kidsPoolCloseTime)}</p>
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
              {t("galleryBadge")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">{t("galleryTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("galleryIntro")}
              <span className="hidden md:inline">
                {" "}
                {t("galleryDesktop")}
              </span>
              <span className="md:hidden"> {t("galleryMobile")}</span>
            </p>
          </div>
        </div>
        <ArtisticGallery images={galleryImages.map((image) => ({ src: image.src, alt: t(`alts.${image.altKey}`) }))} />
      </section>
    </div>
  )
}
