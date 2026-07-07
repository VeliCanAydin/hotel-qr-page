'use client';

import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Activity = {
    time: string;
    event: string;
};

type DaySchedule = {
    day: string;
    activities: Activity[];
};

type WeeklyScheduleCarouselProps = {
    schedule: DaySchedule[];
};

export default function WeeklyScheduleCarousel({ schedule }: WeeklyScheduleCarouselProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const getCurrentDayIndex = () => {
        const today = new Date().getDay();
        // Convert Sunday (0) to index 6, and shift others back by 1
        // Assuming your schedule array starts with Monday at index 0
        return today === 0 ? 6 : today - 1;
    };


    useEffect(() => {
        if (!api) return;

        const currentDayIndex = getCurrentDayIndex();
        api.scrollTo(currentDayIndex, true); // true = instant jump without animation
        setCurrent(currentDayIndex);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const scrollPrev = () => api?.scrollPrev();
    const scrollNext = () => api?.scrollNext();

    return (
        <div className="w-full">
            {/* Carousel without side buttons */}
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {schedule.map((daySchedule, index) => (
                        <CarouselItem key={index}>
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-4 text-center">{daySchedule.day}</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Time</TableHead>
                                            <TableHead>Activity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {daySchedule.activities.map((activity, activityIndex) => (
                                            <TableRow key={activityIndex}>
                                                <TableCell className="font-medium">{activity.time}</TableCell>
                                                <TableCell>{activity.event}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Navigation buttons below the carousel */}
            <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    disabled={current === 0}
                    className="rounded-full"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Dot indicators */}
                <div className="flex gap-2">
                    {schedule.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === current
                                ? "bg-primary w-6"
                                : "bg-gray-300 hover:bg-gray-400"
                                }`}
                            aria-label={`Go to ${schedule[index].day}`}
                        />
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    disabled={current === schedule.length - 1}
                    className="rounded-full"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
