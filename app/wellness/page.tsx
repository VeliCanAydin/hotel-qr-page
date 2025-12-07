import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import ServiceCard from "@/components/spa-wellness/ServiceCard"

export default function WellnessPage() {
    const services = [
        {
            image: "/wellness/EVG01681-Enhanced-NR-HDR-Edit.jpeg",
            imageAlt: "Fitness",
            title: "Fitness",
            description:
                "For sports enthusiasts and anyone who wants to stay fit during their holiday, discover expert-designed training sessions at Dosinia Luxury Resort. With modern equipment and a spacious gym, enjoy every workout while boosting your energy and reaching your fitness goals.",
            hours: "07:00 - 22:00",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/wellness/wellness-nedir-4.webp",
            imageAlt: "Yoga",
            title: "Yoga",
            description:
                "Yoga sessions are a perfect opportunity to balance both body and mind. With our expert instructors, reconnect with yourself in a peaceful atmosphere. Improve flexibility, leave stress behind, and reach a deeper sense of inner calm.",
            hours: "08:30 - 09:30",
            isPaid: false,
            reservationRequired: true,
        },
        {
            image: "/wellness/sabah-jimnastigi.jpeg",
            imageAlt: "Morning Gymnastics",
            title: "Morning Gymnastics",
            description:
                "Start your day with energy through enjoyable sessions led by professional trainers. Refresh your body and mind, feel revitalized, and build a healthy daily ritual that helps you begin the day feeling strong and active.",
            hours: "09:00 - 09:30",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/wellness/havuz-jimnastigi.jpeg",
            imageAlt: "Pool Gymnastics",
            title: "Pool Gymnastics",
            description:
                "Strengthen your body and unwind at the same time with fun and effective exercises in the pool. Enjoy the water while staying in shape, and refresh your energy with the relaxing effect of a water-based workout.",
            hours: "11:00 - 11:30",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/wellness/thumbnail_Aqua_spinning_class_aboard_a_cruise_ship.webp",
            imageAlt: "Aqua Spinning",
            title: "Aqua Spinning",
            description:
                "Aqua Spinning delivers a dynamic workout powered by the natural resistance of water. Pedal in the pool to burn calories and train your whole body with joint-friendly movement. A high-energy activity that is both fun and effective.",
            hours: "16:00 - 16:45",
            isPaid: true,
            reservationRequired: true,
        },
        {
            image: "/wellness/aqua-jump-3.jpeg",
            imageAlt: "Aqua Trampoline",
            title: "Aqua Trampoline",
            description:
                "Enjoy a playful jumping experience on the water for an energetic and refreshing workout. Stay in shape while having fun, and feel the soothing, cooling effect of water. It is also a fantastic pool activity for adults.",
            hours: "17:00 - 17:30",
            isPaid: true,
            reservationRequired: true,
        },
        {
            image: "/wellness/woman-throwing-ball-beach-1.jpeg",
            imageAlt: "Beach Volleyball",
            title: "Beach Volleyball",
            description:
                "Play with friends or family under the sun and combine fun with physical activity. Feel the spirit of the game on the beach and crown your holiday with lively memories and great energy.",
            hours: "10:30 - 12:00",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/wellness/kangoo-jump.jpeg",
            imageAlt: "Kangoo Jump",
            title: "Kangoo Jump",
            description:
                "Kangoo Jump offers a fun and energetic workout using special rebound boots. Turn cardio into an enjoyable experience, activate your whole body, and burn calories while having a great time. A perfect choice for anyone who loves dynamic movement.",
            hours: "18:00 - 18:45",
            isPaid: true,
            reservationRequired: true,
        },
        {
            image: "/wellness/EVG00355-rotated.jpeg",
            imageAlt: "Water Polo",
            title: "Water Polo",
            description:
                "Water polo brings an energetic and exciting team challenge to the pool. Build team spirit, enjoy fast-paced moments, and create unforgettable memories in refreshing water. It is the perfect blend of sport and fun.",
            hours: "15:00 - 15:45",
            isPaid: false,
            reservationRequired: false,
        },
        {
            image: "/wellness/3d-rendering-arrow-hitting-target.jpeg",
            imageAlt: "Dart Games",
            title: "Dart Games",
            description:
                "Dart games offer a fun and competitive experience. Enjoy quality time with friends or family while improving your aim and focus. Moments spent around the dartboard will add extra joy to your holiday.",
            hours: "19:00 - 22:30",
            isPaid: false,
            reservationRequired: false,
        },
    ];


    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <Image
                    src="/wellness/wellness-nedir-4.webp"
                    alt="wellness Hero"
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
                        Dosinia Wellness
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
                    Add value to your holiday by renewing yourself with activities such as fitness, yoga or water sports where you will increase the energy in your body.                </p>
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