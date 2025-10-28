import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock } from "lucide-react";

interface AccordionKidsCareInterface {
    trigger: string;
    content: string;
}

export default function AccordionKidsCare({ trigger: trigger, content: content }: AccordionKidsCareInterface) {
    return (
        <Accordion type="single" collapsible className="border rounded-2xl">
            <AccordionItem value="item-1">
                <AccordionTrigger className="p-3 font-medium items-center"><div className="flex gap-2 items-center"><Clock />{trigger}</div></AccordionTrigger>
                <AccordionContent className="px-4">
                    {content}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}