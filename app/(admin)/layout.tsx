import { Suspense } from "react"
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Manrope } from "next/font/google"
import { verifyToken } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { HMRBodyUnlocker } from "@/components/hmr-body-unlocker"
import "../globals.css"
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AppSidebar } from "@/components/admin/app-sidebar"
import { getAccessControlSnapshot } from '@/lib/access-store'
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

const manrope = Manrope({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

export const viewport: Viewport = {
    themeColor: "#1e3a5f",
    width: "device-width",
    initialScale: 1,
}

export const metadata: Metadata = {
    title: "Dosinia Luxury Hotel",
    description: "Experience the best luxury stay at Dosinia Hotel.",
    icons: {
        icon: "/icons/icon-128x128.png",
        apple: "/icons/icon-128x128.png",
    },
}

// Reads the admin session (cookies + DB), so it renders inside the layout's
// <Suspense> boundary; dashboard pages are covered by the same boundary.
async function AdminShell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin-session")?.value
    const token = session ? await verifyToken(session) : null
    const roleName = token?.roleName ?? ""
    // Attempt to load access control snapshot from DB so the sidebar shows
    // role-specific links that were updated via the Access Control UI.
    let allowedPageKeys: string[] | undefined = undefined
    try {
        const snapshot = await getAccessControlSnapshot()
        const currentRole = snapshot.roles.find((r) => r.name === roleName)
        if (currentRole) {
            allowedPageKeys = Object.entries(currentRole.permissions)
                .filter(([, allowed]) => allowed)
                .map(([key]) => key)
        }
    } catch {
        // ignore and fall back to in-memory presets inside the sidebar
    }

    let currentUser = token ? { name: token.email?.split('@')[0] ?? token.email, email: token.email } : undefined
    // Prefer authoritative name from DB when possible
    try {
        if (token?.userId) {
            const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, token.userId)).limit(1)
            const row = rows[0]
            if (row) {
                // schema may not have a 'name' column; show email as primary identifier
                currentUser = { name: row.email, email: row.email }
            }
        }
    } catch (err) {
        // fallback to token-derived name
    }

    return (
        <SidebarProvider>
            <AppSidebar roleName={roleName} allowedPageKeys={allowedPageKeys} user={currentUser} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <AdminBreadcrumb />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
            <Toaster richColors position="bottom-right" />
        </SidebarProvider>
    );
}

// Root layout for the admin panel — owns <html>/<body> (the guest surfaces
// have their own root layout under app/[locale]). The dashboard is
// intentionally single-language (plan §0), so `lang` stays "en".
export default function AdminLayout({
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
                    <Suspense>
                        <AdminShell>{children}</AdminShell>
                    </Suspense>
                </ThemeProvider>
                <HMRBodyUnlocker />
            </body>
        </html>
    );
}
