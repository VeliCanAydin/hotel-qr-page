"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_FOOTER_ROUTES = ["/ai-assistant"];

export default function FooterWrapper() {
    const pathname = usePathname();

    if (HIDDEN_FOOTER_ROUTES.includes(pathname)) {
        return null;
    }

    return <Footer />;
}
