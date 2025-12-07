import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import ServiceCard from "@/components/spa-wellness/ServiceCard"

export default function SpaPage() {
    const services = [
        {
            image: "/spa/dosinia_luxury_resort_spa_turkish_bath-1.jpeg",
            imageAlt: "Turkish Bath",
            title: "Turkish Bath",
            description: "Our Turkish Bath is waiting for you as a modern interpretation of traditional relaxation. Enjoy the steam and massage while resting on the hot stones. It is the perfect space for a deep relaxation and refresh experience.",
            hours: "08:00 - 20:00",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/spa/dosinia_luxury_resort_spa_massage_room-1.jpeg",
            imageAlt: "Massage & Aromatherapy",
            title: "Massage & Aromatherapy",
            description: "Rejuvenating massage rituals combined with aromatic oils tailored to your needs. Ease tension, improve circulation, and unwind in a serene atmosphere.",
            hours: "08:00 - 20:00",
            isPaid: true,
            reservationRequired: true,
            badges: ["Classic Massage", "Aroma Therapy", "Relax Massage", "Hot Stone Massage", "Chocolate Massage", "Algae Massage", "Waist Massage", "Medical Massage"],
        },
        {
            image: "/spa/dosinia_luxury_resort_spa_sauna-1.jpeg",
            imageAlt: "Sauna & Steam Room",
            title: "Sauna & Steam Room",
            description: "Our sauna and steam room are the address of relaxation and renewal. Relax your muscles in the warm environment of the sauna, experience a deep feeling of cleanliness in the steam room. An ideal escape to revive both your body and your soul.",
            hours: "09:00 - 18:00",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/spa/dosinia_luxury_resort_spa_salt_bath_2-1.jpeg",
            imageAlt: "Salt Room Therapy",
            title: "Salt Room Therapy",
            description: "Our salt room offers a relaxing experience that supports your health. Experience a deep relaxation in its calming environment while cleansing your respiratory tract with the natural healing effect of salt. It is an ideal space to renew both physically and mentally.",
            hours: "08:00 - 19:30",
            isPaid: true,
            reservationRequired: true,
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <Image
                    src="/spa/EVG00994-Enhanced-NR-HDR-Edit.jpeg"
                    alt="Beach & Pools Hero"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <Badge variant="secondary" className="mb-4 text-sm">
                        Relax & Rejuvenate
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
                        Dosinia Spa
                    </h1>
                </div>
            </section>

            <div className="flex flex-col p-4 gap-4">
                {/* <Image
                    src="/spa/EVG00994-Enhanced-NR-HDR-Edit.jpeg"
                    alt="Kids Care"
                    fill
                    className="object-cover"
                /> */}
                <p className="text-muted-foreground text-lg leading-relaxed">
                    You will experience one of the most precious moments of your holiday at Dosinia Spa. With its professional team, excellent hygiene environment and quality spa products, you can relax and start your future moments by feeling refreshed and great.
                </p>
                <h2 className="text-3xl font-bold mb-4">Services</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {services.map((service) => (
                        <ServiceCard key={service.title} data={service} />
                    ))}
                </div>
            </div>

        </div>
    );
}