'use client';

import Image from "next/image";
import AccordionKidsCare from '@/components/kids-care/AccordionKidsCare';
import ScheduleDrawer from '@/components/kids-care/ScheduleDrawer';

export type Activity = {
    time: string;
    event: string;
};

interface DaySchedule {
    day: string;
    activities: Activity[];
};



type ServiceCardProps = {
    data: {
        image: string;
        imageAlt: string;
        title: string;
        description: string;
        accordionItems?: Array<{ trigger: string; content: string }>; // Optional
        schedule?: DaySchedule[]; // Optional
    };
};

export default function ServiceCard({ data }: ServiceCardProps) {
    return (
        <div className="overflow-hidden">
            {/* Image Section */}
            <div className="relative w-full h-[200px] rounded-tl-3xl rounded-tr-3xl overflow-hidden">
                <Image
                    src={data.image}
                    alt={data.imageAlt}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-4 gap-3 border rounded-bl-3xl rounded-br-3xl">
                <h1 className="font-bold text-lg">{data.title}</h1>
                <p className="text-stone-400">{data.description}</p>

                {/* Conditionally render accordions */}
                {data.accordionItems && data.accordionItems.length > 0 && (
                    <>
                        {data.accordionItems.map((item, index) => (
                            <AccordionKidsCare
                                key={index}
                                trigger={item.trigger}
                                content={item.content}
                            />
                        ))}
                    </>
                )}

                {/* Conditionally render schedule drawer */}
                {data.schedule && data.schedule.length > 0 && (
                    <ScheduleDrawer schedule={data.schedule} />
                )}
            </div>
        </div>
    );
}
