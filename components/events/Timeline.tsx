"use client";

import { useEffect, useState, useRef } from "react";
import { HotelEvent } from "@/lib/data/events";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

interface TimelineProps {
  events: HotelEvent[];
  selectedDate: Date;
}

// Timeline hours from 6 AM to midnight (00:00)
const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 24;
const HOUR_HEIGHT = 60; // pixels per hour

export function Timeline({ events, selectedDate }: TimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount and when selected date changes
  useEffect(() => {
    if (nowLineRef.current && isToday(selectedDate)) {
      nowLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedDate]);

  // Check if selected date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Calculate position of the "now" line
  const getNowLinePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = TIMELINE_START_HOUR * 60;
    const position = ((totalMinutes - startMinutes) / 60) * HOUR_HEIGHT;
    return Math.max(0, position);
  };

  // Calculate event position and height
  const getEventStyle = (event: HotelEvent) => {
    const [startHours, startMinutes] = event.startTime.split(":").map(Number);
    const [endHours, endMinutes] = event.endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const timelineStartMinutes = TIMELINE_START_HOUR * 60;

    const top =
      ((startTotalMinutes - timelineStartMinutes) / 60) * HOUR_HEIGHT;
    const height = ((endTotalMinutes - startTotalMinutes) / 60) * HOUR_HEIGHT;

    return {
      top: `${Math.max(0, top)}px`,
      height: `${Math.max(HOUR_HEIGHT / 2, height)}px`, // Minimum height for visibility
    };
  };

  // Format hour for display (24-hour format)
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  // Generate hours array
  const hours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
    (_, i) => TIMELINE_START_HOUR + i
  );

  const showNowLine = isToday(selectedDate);
  const nowPosition = getNowLinePosition();

  return (
    <div className="relative border rounded-lg bg-background overflow-auto max-h-[60vh]" ref={timelineRef}>
      {/* Timeline grid */}
      <div
        className="relative"
        style={{
          height: `${(TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_HEIGHT}px`,
        }}
      >
        {/* Hour lines and labels */}
        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-border/50"
            style={{ top: `${index * HOUR_HEIGHT}px` }}
          >
            <span className="absolute left-2 -top-2.5 text-xs text-muted-foreground bg-background px-1">
              {formatHour(hour)}
            </span>
          </div>
        ))}

        {/* Events */}
        {events.map((event) => (
          <EventCard key={event.id} event={event} style={getEventStyle(event)} />
        ))}

        {/* "Now" line */}
        {showNowLine && (
          <div
            ref={nowLineRef}
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${nowPosition}px` }}
          >
            <div className="relative flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
