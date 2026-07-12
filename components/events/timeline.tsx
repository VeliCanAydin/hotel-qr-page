"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { HotelEvent } from "@/lib/types/events";
import { EventCard } from "./event-card";

interface TimelineProps {
  events: HotelEvent[];
  selectedDate?: Date;
  onEventClick: (event: HotelEvent) => void;
  alwaysShowNowLine?: boolean;
}

// Full 24-hour timeline
const TIMELINE_START_HOUR = 0;
const TIMELINE_END_HOUR = 24;
const HOUR_HEIGHT = 64; // pixels per hour

export function Timeline({ events, selectedDate, onEventClick, alwaysShowNowLine = false }: TimelineProps) {
  // Set after mount: prerendered HTML can't read the current clock
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set current time on mount, then update every minute
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if selected date is today
  const isToday = useCallback(
    (date?: Date) => {
      if (!date || !currentTime) return false;
      return (
        date.getDate() === currentTime.getDate() &&
        date.getMonth() === currentTime.getMonth() &&
        date.getFullYear() === currentTime.getFullYear()
      );
    },
    [currentTime]
  );

  // Calculate pixel position of the "now" line from top of timeline
  const getNowLinePosition = useCallback(() => {
    if (!currentTime) return 0;
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = TIMELINE_START_HOUR * 60;
    return Math.max(0, ((totalMinutes - startMinutes) / 60) * HOUR_HEIGHT);
  }, [currentTime]);

  // Scroll the container so the now line is vertically centered
  useEffect(() => {
    if (!containerRef.current || !currentTime) return;
    const nowPosition = getNowLinePosition();
    const containerHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTop = nowPosition - containerHeight / 2;
  }, [currentTime, selectedDate, getNowLinePosition]);

  // Calculate event position and height
  const getEventStyle = (event: HotelEvent) => {
    const [startHours, startMinutes] = event.startTime.split(":").map(Number);
    const [endHours, endMinutes] = event.endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const timelineStartMinutes = TIMELINE_START_HOUR * 60;

    const top = ((startTotalMinutes - timelineStartMinutes) / 60) * HOUR_HEIGHT;
    const height = ((endTotalMinutes - startTotalMinutes) / 60) * HOUR_HEIGHT;

    return {
      top: `${Math.max(0, top)}px`,
      height: `${Math.max(HOUR_HEIGHT / 2, height)}px`,
    };
  };

  // Format hour for display (24-hour format)
  const formatHour = (hour: number) => {
    if (hour === 24) return "00:00";
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  // Generate hours array (0 through 23, plus 24 as end marker)
  const hours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
    (_, i) => TIMELINE_START_HOUR + i
  );

  const showNowLine = alwaysShowNowLine || isToday(selectedDate);
  const nowPosition = getNowLinePosition();

  return (
    <div
      ref={containerRef}
      className="relative border rounded-lg bg-background overflow-auto"
      style={{ maxHeight: "70vh" }}
    >
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
          <EventCard key={event.id} event={event} style={getEventStyle(event)} onClick={onEventClick} />
        ))}

        {/* "Now" line — always rendered when today is selected so the ref is mounted */}
        {showNowLine && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${nowPosition}px` }}
          >
            <div className="relative flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shrink-0" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
