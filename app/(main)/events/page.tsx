
"use client";

import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Timeline } from "@/components/events/Timeline";
import { getEventsForDate, getDatesWithEvents } from "@/lib/data/events";

export default function PageEvent() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Get events for the selected date
    // This is memoized to avoid recalculating on every render
    // When data comes from a database, this could be replaced with
    // a useEffect + fetch or React Query/SWR hook
    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return getEventsForDate(selectedDate);
    }, [selectedDate]);

    return (
        <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
            {/* Calendar Section */}
            <div className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
                    buttonVariant="ghost"
                    ISOWeek
                />
            </div>

            {/* Timeline Section */}
            <div className="flex-1 min-w-0">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Events</h2>
                    <p className="text-muted-foreground text-sm">
                        {eventsForSelectedDate.length === 0
                            ? "No events scheduled"
                            : `${eventsForSelectedDate.length} event${eventsForSelectedDate.length > 1 ? "s" : ""} scheduled`}
                    </p>
                </div>

                {eventsForSelectedDate.length > 0 ? (
                    <Timeline events={eventsForSelectedDate} selectedDate={selectedDate} />
                ) : (
                    <div className="border rounded-lg p-8 text-center text-muted-foreground">
                        <p>No events scheduled for this day.</p>
                        <p className="text-sm mt-2">
                            Select a different date to view events.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}   