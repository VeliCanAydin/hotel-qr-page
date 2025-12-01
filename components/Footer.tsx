import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full border-t mt-8 bg-muted dark:bg-muted/40">
            {/* Contact Section */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Contact Info - Inline */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3">
                        {/* Address */}
                        <a
                            href="https://maps.google.com/?q=Kemer,Antalya,Turkey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <MapPin className="size-4" />
                            <span>Kemer, Antalya</span>
                        </a>

                        {/* Email */}
                        <a
                            href="mailto:info@dosiniahotels.com"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Mail className="size-4" />
                            <span>info@dosiniahotels.com</span>
                        </a>

                        {/* Phone */}
                        <a
                            href="tel:+902428248100"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Phone className="size-4" />
                            <span>+90 242 824 81 00</span>
                        </a>
                    </div>

                    {/* Reservation Button */}
                    <Button asChild size="sm">
                        <a href="https://dosiniahotels.com/reservation" target="_blank" rel="noopener noreferrer">
                            Make a Reservation
                        </a>
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Our Hotels Section */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h3 className="text-lg font-semibold text-center mb-6">Our Hotels</h3>
                <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
                    {/* Grand Ring Hotel */}
                    <a
                        href="https://grandringhotel.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-300"
                    >
                        <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">Grand Ring Hotel</h4>
                            <p className="text-xs text-muted-foreground">Kemer, Antalya</p>
                        </div>
                        <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>

                    {/* Justinn City */}
                    <a
                        href="https://justinncity.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-300"
                    >
                        <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">Justinn City</h4>
                            <p className="text-xs text-muted-foreground">City Hotel</p>
                        </div>
                        <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                </div>
            </div>

            <Separator />

            {/* Bottom Links & Copyright */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                    <Link
                        href="/sustainability"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Sustainability
                    </Link>
                    <span className="hidden sm:inline text-muted-foreground/50">•</span>
                    <Link
                        href="/hotel-policies"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Hotel Policies
                    </Link>
                    <span className="hidden sm:inline text-muted-foreground/50">•</span>
                    <Link
                        href="/cookie-policy"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Cookie Policy
                    </Link>
                    <span className="hidden sm:inline text-muted-foreground/50">•</span>
                    <Link
                        href="/kvkk"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        KVKK
                    </Link>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Dosinia Luxury Hotel. All rights reserved.
                </p>
            </div>
        </footer>
    );
}