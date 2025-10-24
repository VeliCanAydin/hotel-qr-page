import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/Header";
import { Roboto, Manrope } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dosinia Luxury Hotel",
  description: "Experience the best luxury stay at Dosinia Hotel.",
  keywords: ["hotel", "luxury", "stay", "Dosinia"],
  authors: [{ name: "Dosinia Team", url: "https://dosinia.com" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.className}>
      <body>
        <ThemeProvider attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html >
  );
}
