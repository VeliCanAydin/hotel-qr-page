import React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { ItemSeparator } from "@/components/ui/item"
import { Phone, Mail, MessageCircleMore, ChevronRight, Lock } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getPublicHotelInfo } from "@/lib/content"
import { verifyGuestToken, GUEST_SESSION_COOKIE } from "@/lib/auth"

export default async function HotelInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("hotelInfo")
  const info = await getPublicHotelInfo()

  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  const guestPayload = token ? await verifyGuestToken(token) : null
  const isGuest = guestPayload !== null

  const contacts = [
    {
      username: "Phone",
      name: t("phone"),
      icon: <Phone />,
      label: info.phone,
      link: `tel:${info.phone.replace(/\D/g, "")}`,
    },
    {
      username: "Mail",
      name: t("mail"),
      icon: <Mail />,
      label: info.email,
      link: `mailto:${info.email}`,
    },
    {
      username: "WhatsApp",
      name: "WhatsApp",
      icon: <MessageCircleMore />,
      label: info.whatsapp,
      link: `https://api.whatsapp.com/send/?phone=${info.whatsapp.replace(/\D/g, "")}&text=Dosinia+Luxury+Resort&type=phone_number&app_absent=0`,
    },
  ]

  return (
    <main className="flex flex-col gap-8 pb-10">
      <section className="relative h-[42vh] min-h-80 overflow-hidden">
        <Image
          src="/dosinia_luxury_resort_main_building_front_view_main_pool.jpeg"
          alt="Dosinia Luxury Hotel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
          <p className="mb-3 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur-sm">
            Dosinia Luxury Resort
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("title")}</h1>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4">
        <div>
          <h2 className="text-2xl font-bold leading-8 mb-4">{t("about")}</h2>
          <p className="leading-6">{info.aboutText}</p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <h2 className="text-2xl font-bold leading-8">{t("contact")}</h2>
          <div className="border rounded-lg">
            {contacts.map((contact, index) => (
              <React.Fragment key={contact.username}>
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex flex-row items-center gap-4">
                    <div>{contact.icon}</div>
                    <div>
                      <h2>{contact.name}</h2>
                      <span>{contact.label}</span>
                    </div>
                  </div>
                  <a href={contact.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <ChevronRight />
                    </Button>
                  </a>
                </div>
                {index !== contacts.length - 1 && <ItemSeparator />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold leading-8">{t("services")}</h2>
          <Accordion type="single" collapsible className="px-4 border rounded-lg">
            <AccordionItem value="wifi">
              <AccordionTrigger className="text-base">{t("wifi")}</AccordionTrigger>
              <AccordionContent>
                {isGuest ? (
                  <>
                    <p><strong>{t("wifiNetwork")}</strong> {info.wifiName}</p>
                    <p><strong>{t("wifiPasswordLabel")}</strong> {info.wifiPassword}</p>
                  </>
                ) : (
                  <div className="flex items-center gap-3 py-1 text-muted-foreground">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-sm">
                      {t.rich("wifiLocked", {
                        link: (chunks) => (
                          <Link
                            href="/login?redirect=/hotel-info"
                            className="text-foreground underline underline-offset-2 hover:text-primary"
                          >
                            {chunks}
                          </Link>
                        ),
                      })}
                    </span>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="checkin">
              <AccordionTrigger className="text-base">{t("checkInOut")}</AccordionTrigger>
              <AccordionContent>
                <p>{t.rich("checkIn", { b: (chunks) => <strong>{chunks}</strong>, start: info.checkInStart, end: info.checkInEnd })}</p>
                <p>{t.rich("checkOut", { b: (chunks) => <strong>{chunks}</strong>, time: info.checkOut })}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cancellation">
              <AccordionTrigger className="text-base">{t("cancellation")}</AccordionTrigger>
              <AccordionContent>{info.cancellationPolicy}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </main>
  )
}

