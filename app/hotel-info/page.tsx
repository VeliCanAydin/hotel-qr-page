"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    ItemSeparator,
} from "@/components/ui/item"
import { Phone, Mail, MessageCircleMore, ChevronRight } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const contacts = [
    {
        username: "Phone",
        icon: <Phone />,
        email: "+90 (242) 824 02 02",
        link: "tel:+902428240202"
    },
    {
        username: "Mail",
        icon: <Mail />,
        email: "info@dosinialuxuryresort.com",
        link: "mailto:info@dosinialuxuryresort.com"
    },
    {
        username: "WhatsApp",
        icon: <MessageCircleMore />,
        email: "+90 (242) 824 02 02",
        link: "https://api.whatsapp.com/send/?phone=905458240202&text=Dosinia+Luxury+Resort&type=phone_number&app_absent=0"
    },
]


export default function HotelInfoPage() {
    return (
        <main className="flex flex-col gap-8 max-w-4xl mx-auto p-4">

            <div>
                <h1 className="text-2xl font-bold leading-8 mb-4">About Our Hotel</h1>
                <p className="leading-6">
                    Welcome to Dosinia Luxury Hotel, where comfort meets elegance. Our hotel offers
                    top-notch amenities, exquisite dining options, and exceptional service to ensure your
                    stay is unforgettable.
                </p>
            </div>

            <div className="flex w-full max-w-md flex-col gap-4">
                <h1 className="text-2xl font-bold leading-8">Contact</h1>
                <div className="border rounded-lg">
                    {contacts.map((contact, index) => (
                        <React.Fragment key={contact.username}>
                            <div className="flex items-center justify-between p-4 rounded-lg">
                                <div className="flex flex-row items-center gap-4">
                                    <div>
                                        {contact.icon}
                                    </div>
                                    <div>
                                        <h1>{contact.username}</h1>
                                        <span className=" ">{contact.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <Button variant="secondary" size="icon" className="rounded-full cursor-pointer" onClick={() => {
                                        if (contact.link) {
                                            window.open(contact.link, "_blank");
                                        }
                                    }}>
                                        <ChevronRight />
                                    </Button>
                                </div>
                            </div>
                            {index !== contacts.length - 1 && <ItemSeparator />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold leading-8">Hotel Services</h1>
                <Accordion type="single" collapsible className="px-4 border rounded-lg">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-base">Wi-Fi Settings</AccordionTrigger>
                        <AccordionContent>
                            <p><strong>Network Name (SSID):</strong> Dosinia_Guest</p>
                            <p><strong>Password:</strong> LuxuryStay2024</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-base">Check-In & Check-Out Times</AccordionTrigger>
                        <AccordionContent>
                            <p><strong>12.00 - 18.00</strong> for Check-In</p>
                            <p><strong>Until 12.00</strong> for Check-Out</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-base">Cancellation Policy</AccordionTrigger>
                        <AccordionContent>
                            Cancellations made within 24 hours of booking are fully refundable. For cancellations made after this period, a fee equivalent to one night's stay will be charged.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <div>
                
            </div>
        </main>
    );
}

