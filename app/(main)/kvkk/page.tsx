import type { Metadata } from "next"
import { ScrollText, UserCheck, FileText, Mail } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "KVKK | Dosinia Luxury Hotel",
  description:
    "Personal data protection notice under the Turkish Personal Data Protection Law (KVKK, Law No. 6698).",
}

const processedData = [
  {
    title: "Identity & Stay Information",
    detail:
      "Name, surname, and room number — used to verify your reservation when you sign in to the guest portal and to deliver room service orders.",
  },
  {
    title: "Contact Information",
    detail:
      "Email address, if you choose to provide it with your feedback — used only to follow up on your comments.",
  },
  {
    title: "Requests & Feedback",
    detail:
      "Ratings, comments, support and complaint requests, and any photos you attach to them — used by our Guest Relations team to resolve issues and improve our services.",
  },
  {
    title: "Order Information",
    detail:
      "Room service order contents and delivery notes — used to prepare and deliver your order and for internal service records.",
  },
]

const rights = [
  "Learn whether your personal data is being processed",
  "Request information about the processing if it is",
  "Learn the purpose of processing and whether data is used accordingly",
  "Know the third parties, domestic or abroad, to whom data is transferred",
  "Request correction of incomplete or inaccurate data",
  "Request deletion or destruction of your data under the conditions of Article 7",
  "Request notification of correction/deletion to third parties who received the data",
  "Object to results that arise against you from analysis exclusively by automated systems",
  "Claim compensation for damages arising from unlawful processing",
]

export default function KvkkPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Personal Data Protection Notice (KVKK)</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          This notice is provided pursuant to Article 10 of the Turkish Personal Data Protection
          Law No. 6698 (&ldquo;KVKK&rdquo;). As the data controller,{" "}
          <strong className="text-foreground">Dosinia Luxury Hotel</strong> (Kemer, Antalya,
          Türkiye) processes the personal data you share through this website with care and only
          for the purposes described below.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          Data We Process and Why
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {processedData.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {item.detail}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your data is processed based on the legal grounds in Article 5 of KVKK — primarily the
          performance of the accommodation contract between you and the hotel, and our legitimate
          interest in improving guest services. Your data is not used for marketing purposes
          without your explicit consent, and it is not sold or shared with third parties except
          where required by law or for the technical operation of this website (secure cloud
          hosting and storage providers).
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Retention</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Personal data is retained only for as long as required by the purposes above and by
          applicable legislation (including tourism and tax regulations), after which it is
          deleted, destroyed, or anonymized in accordance with Article 7 of KVKK.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserCheck className="size-5 text-primary" />
          Your Rights (Article 11)
        </h2>
        <p className="text-sm text-muted-foreground">
          Under Article 11 of KVKK, you have the right to:
        </p>
        <ul className="flex flex-col gap-2">
          {rights.map((right) => (
            <li key={right} className="flex items-start gap-3 p-3 rounded-lg border bg-card text-sm">
              <UserCheck className="size-4 text-primary mt-0.5 shrink-0" />
              <span>{right}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          How to Apply
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You may submit your requests regarding your rights above in writing to our reception
          desk, or by email to{" "}
          <a href="mailto:info@dosiniahotels.com" className="underline hover:text-primary transition-colors">
            info@dosiniahotels.com
          </a>
          . Applications are answered free of charge and as soon as possible, at the latest within
          thirty days, in accordance with Article 13 of KVKK.
        </p>
      </section>
    </main>
  )
}
