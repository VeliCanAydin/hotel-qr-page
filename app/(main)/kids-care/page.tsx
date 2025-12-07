import Image from "next/image";
import { ShieldCheck, PartyPopper, SmilePlus } from "lucide-react";
import { weeklySchedule } from "@/lib/data/kidsClubData";
import Benefits from "@/components/kids-care/Benefits";
import ServiceCard from "@/components/kids-care/ServiceCard";

export default function KidsCarePage() {
    return (
        <div className="flex flex-col p-4 gap-4">
            <div className="relative w-full h-[200px] rounded-3xl overflow-hidden">
                <Image
                    src="/kids-care.png"
                    alt="Kids Care"
                    fill
                    className="object-cover"
                />
            </div>
            <p>We are dedicated to providing a safe, fun, and engaging environment for our youngest guests. Explore our bespoke services designed to ensure a memorable stay for the entire family.</p>
            <div className="grid grid-cols-3 gap-3">
                <Benefits icon={ShieldCheck} title="Certified Staff" content="Trained & Vetted" />
                <Benefits icon={PartyPopper} title="All Ages" content="Toddlers to Teens" />
                <Benefits icon={SmilePlus} title="Creative Play" content="Fun-filled Activities" />
            </div>

            <ServiceCard data={{
                image: "/kids-club.png",
                imageAlt: "Kids Club",
                title: "The Kid's Club",
                description: "A world of fun awaits in our state-of-the-art play area. Supervised by our certified team, children can enjoy creative crafts, games, and activities in a safe and stimulating environment.",
                accordionItems: [
                    { trigger: "Operating Hours & Location", content: "Our kids' club is open between 10:30 to 23:30." },
                    { trigger: " Age Groups", content: "Our kids' club is open to children aged 3 to 16." }
                ],
                schedule: weeklySchedule
            }} />
            <ServiceCard data={{
                image: "/gaming-room.png",
                imageAlt: "Kids Club",
                title: "Gaming Room",
                description: "Our gaming room is equipped with the latest consoles and games, providing a thrilling experience for kids and teens alike. Supervised sessions ensure a safe and enjoyable environment.",
                accordionItems: [
                    { trigger: "Operating Hours & Location", content: " Our gaming room is open between 10:00 to 18:00." },
                    { trigger: " Age Groups", content: "Our gaming room is open to children aged 3 to 16." }
                ],
            }} />
            <ServiceCard data={{
                image: "/kids-aquapark.png",
                imageAlt: "Kids Club",
                title: "Kids Aquapark",
                description: "Dive into fun at our Kids Aquapark, featuring shallow pools, water slides, and splash zones designed for safety and excitement. Lifeguards are on duty to ensure a secure environment for all children.",
                accordionItems: [
                    { trigger: "Operating Hours & Location", content: "Our kids aquapark is open between 10:00 to 17:00" },
                ],
            }} />
            <ServiceCard data={{
                image: "/spray-action.png",
                imageAlt: "Kids Club",
                title: "Spray Action",
                description: "Our Spray Action area offers a variety of water-based activities and interactive fountains that provide endless fun for kids of all ages. It's the perfect spot to cool off and enjoy some splashy excitement.",
                accordionItems: [
                    { trigger: "Operating Hours & Location", content: "Spray action is from 11:00 to 12:00 and from 15:00 to 16:00." },
                ],
            }} />
        </div>
    );
}