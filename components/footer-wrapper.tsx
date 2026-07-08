"use client";

import { usePathname } from "@/i18n/navigation";
import Footer from "./footer";

const HIDDEN_FOOTER_ROUTES = ["/ai-assistant"];

export default function FooterWrapper() {
    const pathname = usePathname();

    if (HIDDEN_FOOTER_ROUTES.includes(pathname)) {
        return null;
    }

    return <Footer />;
}
