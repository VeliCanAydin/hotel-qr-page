import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { Cookie, ShieldCheck, Database, Settings2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Cookie Policy | Dosinia Luxury Hotel",
  description: "How this website uses cookies and local storage.",
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Cookie className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Cookie Policy</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          This page explains which cookies and browser storage this website uses and why. We keep
          it deliberately simple: we only use what is strictly necessary for the site to work.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">What We Use</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Essential Session Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                When you sign in with your room number, we set a secure, encrypted session cookie
                (<code className="text-foreground">guest-session</code>) so the site remembers who
                you are during your stay. It expires automatically at check-out or after 24 hours.
              </p>
              <p>
                Hotel staff signing in to the admin panel receive an equivalent{" "}
                <code className="text-foreground">admin-session</code> cookie.
              </p>
              <p>
                These cookies are <strong className="text-foreground">strictly necessary</strong> —
                the sign-in features cannot work without them — and are never used for tracking or
                advertising.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="size-4 text-primary" />
                Local Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                Some convenience features store data only on your own device using your browser's
                local storage — it is never sent to our servers:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your room service cart contents</li>
                <li>Your personalized stay plan (selected events)</li>
                <li>Your light/dark theme preference</li>
              </ul>
              <p>Clearing your browser data removes this information.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings2 className="size-5 text-primary" />
          What We Don&apos;t Use
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We do not use advertising cookies, cross-site tracking, or third-party analytics cookies
          on this website. Because we only use strictly necessary cookies, no cookie consent
          banner is required.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Managing Cookies</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You can delete or block cookies at any time through your browser settings. Note that
          blocking essential cookies will prevent you from signing in to the guest portal or
          placing room service orders.
        </p>
        <p className="text-xs text-muted-foreground">
          Questions? Contact us at{" "}
          <a href="mailto:info@dosiniahotels.com" className="underline hover:text-primary transition-colors">
            info@dosiniahotels.com
          </a>
          .
        </p>
      </section>
    </main>
  )
}
