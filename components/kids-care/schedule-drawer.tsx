'use client';

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer";
import WeeklyScheduleCarousel from "@/components/kids-care/weekly-schedule-carousel";

interface Activity {
    time: string;
    event: string;
};

interface DaySchedule {
    day: string;
    activities: Activity[];
};

type ScheduleDrawerProps = {
    schedule: DaySchedule[];
};

export default function ScheduleDrawer({ schedule }: ScheduleDrawerProps) {
    const t = useTranslations("kidsCare");
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    variant="default"
                    className="rounded-3xl font-bold px-5 mt-2 self-center w-full"
                >
                    {t("viewSchedule")}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="flex flex-col gap-4 p-4 max-h-[90vh] overflow-auto">
                    <DrawerHeader>
                        <DrawerTitle>{t("weeklySchedule")}</DrawerTitle>
                        <DrawerDescription>{t("swipeHint")}</DrawerDescription>
                    </DrawerHeader>
                    <WeeklyScheduleCarousel schedule={schedule} />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
