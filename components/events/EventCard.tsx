"use client";

import { HotelEvent, categoryColors } from "@/lib/data/events";
import { cn } from "@/lib/utils";
import { Clock, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: HotelEvent;
  style?: React.CSSProperties;
}

export function EventCard({ event, style }: EventCardProps) {
  const categoryColor = categoryColors[event.category];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className={cn(
            "absolute left-16 right-2 rounded-md px-2 py-1 text-left cursor-pointer",
            "hover:opacity-90 transition-opacity overflow-hidden",
            "border-l-4 text-white",
            categoryColor
          )}
          style={style}
        >
          <div className="font-medium text-sm truncate">{event.title}</div>
          <div className="text-xs opacity-90 truncate">
            {event.startTime} - {event.endTime}
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", categoryColor)} />
            <span className="text-xs uppercase text-muted-foreground font-medium">
              {event.category}
            </span>
          </div>
          <DrawerTitle className="text-xl">{event.title}</DrawerTitle>
          <DrawerDescription className="text-base">
            {event.description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>{event.location}</span>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
