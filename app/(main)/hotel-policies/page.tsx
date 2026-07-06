import type { Metadata } from "next"
import {
  BedDouble,
  CalendarX,
  CreditCard,
  Baby,
  CigaretteOff,
  PawPrint,
  Moon,
  Waves,
  ShieldAlert,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getHotelInfo } from "@/lib/actions/hotel-info"

export const metadata: Metadata = {
  title: "Hotel Policies | Dosinia Luxury Hotel",
  description: "Check-in and check-out times, cancellation terms, and general house rules.",
}

export const dynamic = "force-dynamic"

export default async function HotelPoliciesPage() {
  const info = await getHotelInfo()

  const policies = [
    {
      icon: CigaretteOff,
      title: "Smoking",
      content:
        "All rooms and indoor areas are non-smoking. Smoking is permitted only in designated outdoor areas. A deep-cleaning fee may be charged for smoking in rooms.",
    },
    {
      icon: PawPrint,
      title: "Pets",
      content:
        "Pets are not allowed on the hotel premises, with the exception of certified service animals. Please inform us in advance if you will be accompanied by a service animal.",
    },
    {
      icon: Baby,
      title: "Children & Extra Beds",
      content:
        "Children of all ages are welcome. Baby cots and extra beds are subject to availability — please request them at reception or during booking. Kids Club services are available for registered guests.",
    },
    {
      icon: Moon,
      title: "Quiet Hours",
      content:
        "To ensure a restful stay for all guests, we kindly ask you to keep noise to a minimum between 24:00 and 08:00 in room corridors and garden areas.",
    },
    {
      icon: Waves,
      title: "Pool & Beach",
      content:
        "Pools and the private beach are open during posted hours only; swimming outside these hours is not permitted. Children must be supervised by an adult at all times. Glassware is not allowed in pool and beach areas.",
    },
    {
      icon: ShieldAlert,
      title: "Liability & Valuables",
      content:
        "Please store valuables in your in-room safe. The hotel cannot be held responsible for items left unattended in public areas. Lost & found inquiries can be made at reception.",
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Hotel Policies</h1>
        <p className="text-muted-foreground leading-relaxed">
          The rules below help us keep your stay comfortable, safe, and enjoyable. If you have any
          questions about a policy, our reception team is available around the clock.
        </p>
      </section>

      <Separator />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BedDouble className="size-4 text-primary" />
              Check-In & Check-Out
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-1">
            <p>
              <strong className="text-foreground">Check-in:</strong>{" "}
              {info.checkInStart && info.checkInEnd
                ? `${info.checkInStart} – ${info.checkInEnd}`
                : "From 14:00"}
            </p>
            <p>
              <strong className="text-foreground">Check-out:</strong>{" "}
              {info.checkOut ? `Until ${info.checkOut}` : "Until 12:00"}
            </p>
            <p>
              Early check-in and late check-out are subject to availability — please ask at
              reception.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarX className="size-4 text-primary" />
              Cancellation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {info.cancellationPolicy ||
              "Cancellation terms depend on the rate and booking channel you used. Please refer to your booking confirmation or contact reception for details."}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            We accept major credit cards and cash (TRY, EUR, USD). Extras such as spa treatments,
            à la carte dining, and room service charges can be billed to your room and settled at
            check-out.
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">House Rules</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy.title}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <policy.icon className="size-4 text-primary" />
                  {policy.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {policy.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        For any policy questions, contact us at{" "}
        <a href="mailto:info@dosiniahotels.com" className="underline hover:text-primary transition-colors">
          info@dosiniahotels.com
        </a>
        {info.phone ? (
          <>
            {" "}or call{" "}
            <a href={`tel:${info.phone.replace(/\D/g, "")}`} className="underline hover:text-primary transition-colors">
              {info.phone}
            </a>
          </>
        ) : null}
        .
      </p>
    </main>
  )
}
