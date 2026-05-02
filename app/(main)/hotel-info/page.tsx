import React from "react"
import { Button } from "@/components/ui/button"
import { ItemSeparator } from "@/components/ui/item"
import { Phone, Mail, MessageCircleMore, ChevronRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getHotelInfo } from "@/lib/actions/hotel-info"

export default async function HotelInfoPage() {
  const info = await getHotelInfo()

  const contacts = [
    {
      username: "Phone",
      icon: <Phone />,
      label: info.phone,
      link: `tel:${info.phone.replace(/\D/g, "")}`,
    },
    {
      username: "Mail",
      icon: <Mail />,
      label: info.email,
      link: `mailto:${info.email}`,
    },
    {
      username: "WhatsApp",
      icon: <MessageCircleMore />,
      label: info.whatsapp,
      link: `https://api.whatsapp.com/send/?phone=${info.whatsapp.replace(/\D/g, "")}&text=Dosinia+Luxury+Resort&type=phone_number&app_absent=0`,
    },
  ]

  return (
    <main className="flex flex-col gap-8 max-w-4xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold leading-8 mb-4">About Our Hotel</h1>
        <p className="leading-6">{info.aboutText}</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <h1 className="text-2xl font-bold leading-8">Contact</h1>
        <div className="border rounded-lg">
          {contacts.map((contact, index) => (
            <React.Fragment key={contact.username}>
              <div className="flex items-center justify-between p-4 rounded-lg">
                <div className="flex flex-row items-center gap-4">
                  <div>{contact.icon}</div>
                  <div>
                    <h1>{contact.username}</h1>
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
        <h1 className="text-2xl font-bold leading-8">Hotel Services</h1>
        <Accordion type="single" collapsible className="px-4 border rounded-lg">
          <AccordionItem value="wifi">
            <AccordionTrigger className="text-base">Wi-Fi Settings</AccordionTrigger>
            <AccordionContent>
              <p><strong>Network Name (SSID):</strong> {info.wifiName}</p>
              <p><strong>Password:</strong> {info.wifiPassword}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="checkin">
            <AccordionTrigger className="text-base">Check-In & Check-Out Times</AccordionTrigger>
            <AccordionContent>
              <p><strong>{info.checkInStart} – {info.checkInEnd}</strong> for Check-In</p>
              <p><strong>Until {info.checkOut}</strong> for Check-Out</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancellation">
            <AccordionTrigger className="text-base">Cancellation Policy</AccordionTrigger>
            <AccordionContent>{info.cancellationPolicy}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  )
}

