import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/Header";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Dosinia Luxury Hotel",
  description: "Experience the best luxury stay at Dosinia Hotel.",
  keywords: ["hotel", "luxury", "stay", "Dosinia"],
  authors: [{ name: "Dosinia Team", url: "https://dosinia.com" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dosinia",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-128x128.png",
    apple: "/icons/apple-touch-icon.svg",
  },
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
