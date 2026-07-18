"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { BellRing, MonitorSmartphone, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LOCALES, type Locale } from "@/i18n/routing"
import {
  sendCustomNotification,
  type NotificationRecipient,
  type NotificationText,
  type SentNotification,
} from "@/lib/actions/admin-notifications"

const TITLE_MAX = 100
const BODY_MAX = 500

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
  ru: "Русский",
}

const DESTINATIONS: { value: string; label: string }[] = [
  { value: "/portal",              label: "Guest Portal"     },
  { value: "/events",              label: "Events"           },
  { value: "/portal/room-service", label: "Room Service"     },
  { value: "/restaurants",         label: "Restaurants"      },
  { value: "/spa",                 label: "Spa"              },
  { value: "/wellness",            label: "Wellness"         },
  { value: "/hotel-info",          label: "Hotel Info"       },
  { value: "custom",               label: "Custom path..."   },
]

const EMPTY_TEXTS: Record<Locale, NotificationText> = {
  en: { title: "", body: "" },
  tr: { title: "", body: "" },
  de: { title: "", body: "" },
  ru: { title: "", body: "" },
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

export default function NotificationsClient({
  initialRecipients,
  initialHistory,
}: {
  initialRecipients: NotificationRecipient[]
  initialHistory: SentNotification[]
}) {
  const [history, setHistory] = useState(initialHistory)
  const [target, setTarget] = useState("all")
  const [destination, setDestination] = useState("/portal")
  const [customPath, setCustomPath] = useState("")
  const [texts, setTexts] = useState(EMPTY_TEXTS)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const recipients = initialRecipients
  const subscribedGuests = useMemo(
    () => recipients.filter((r) => r.deviceCount > 0).length,
    [recipients]
  )
  const totalDevices = useMemo(
    () => recipients.reduce((sum, r) => sum + r.deviceCount, 0),
    [recipients]
  )

  const enComplete = texts.en.title.trim().length > 0 && texts.en.body.trim().length > 0
  const path = destination === "custom" ? customPath : destination
  const canSend = enComplete && path.trim().startsWith("/") && !isSending

  const selectedRecipient = recipients.find((r) => r.reservationCode === target)
  const targetDevices = target === "all" ? totalDevices : (selectedRecipient?.deviceCount ?? 0)

  function setText(locale: Locale, field: keyof NotificationText, value: string) {
    setTexts((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }))
  }

  async function handleSend() {
    setConfirmOpen(false)
    setIsSending(true)
    const promise = sendCustomNotification({ target, path: path.trim(), texts })
    toast.promise(promise, {
      loading: "Sending notification...",
      success: (sent) =>
        sent.sentCount > 0
          ? `Notification delivered to ${sent.sentCount} device${sent.sentCount === 1 ? "" : "s"}`
          : "Sent — but no subscribed devices received it",
      error: (err) => (err instanceof Error ? err.message : "Failed to send notification"),
    })
    try {
      const sent = await promise
      setHistory((prev) => [sent, ...prev].slice(0, 50))
      setTexts(EMPTY_TEXTS)
    } catch {
      // toast.promise already surfaced the error
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send custom push notifications to in-house guests — hotel-wide or to a single room
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In-House Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipients.length}</div>
            <p className="text-xs text-muted-foreground">active reservations today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribed Guests</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribedGuests}</div>
            <p className="text-xs text-muted-foreground">enabled push notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reachable Devices</CardTitle>
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">registered for push delivery</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>
            English is required and used as the fallback; other languages are optional. Each
            guest receives the text matching their portal language.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Recipient</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All in-house guests ({totalDevices} device{totalDevices === 1 ? "" : "s"})
                  </SelectItem>
                  {recipients.map((r) => (
                    <SelectItem key={r.reservationCode} value={r.reservationCode}>
                      Room {r.roomNumber} — {r.guestName}
                      {r.deviceCount === 0
                        ? " (no devices)"
                        : ` (${r.deviceCount} device${r.deviceCount === 1 ? "" : "s"})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetDevices === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  This recipient has no subscribed devices — the notification won&apos;t reach anyone.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Opens On Tap</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {destination === "custom" && (
                <Input
                  placeholder="/portal (path without language prefix)"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                />
              )}
            </div>
          </div>

          <Tabs defaultValue="en">
            <TabsList>
              {LOCALES.map((locale) => (
                <TabsTrigger key={locale} value={locale}>
                  {LOCALE_LABELS[locale]}
                  {locale === "en" ? (
                    <span className="text-destructive ml-0.5">*</span>
                  ) : texts[locale].title.trim() && texts[locale].body.trim() ? (
                    <span className="text-green-600 ml-0.5">●</span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
            {LOCALES.map((locale) => (
              <TabsContent key={locale} value={locale} className="flex flex-col gap-4 pt-2">
                {locale !== "en" && (
                  <p className="text-xs text-muted-foreground">
                    Optional — guests using {LOCALE_LABELS[locale]} receive the English text if
                    left empty.
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`title-${locale}`}>Title</Label>
                    <span className="text-xs text-muted-foreground">
                      {texts[locale].title.length}/{TITLE_MAX}
                    </span>
                  </div>
                  <Input
                    id={`title-${locale}`}
                    maxLength={TITLE_MAX}
                    placeholder={locale === "en" ? "e.g. Pool party tonight!" : ""}
                    value={texts[locale].title}
                    onChange={(e) => setText(locale, "title", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`body-${locale}`}>Message</Label>
                    <span className="text-xs text-muted-foreground">
                      {texts[locale].body.length}/{BODY_MAX}
                    </span>
                  </div>
                  <Textarea
                    id={`body-${locale}`}
                    rows={3}
                    maxLength={BODY_MAX}
                    placeholder={
                      locale === "en"
                        ? "e.g. Join us at the main pool at 21:00 for live music and cocktails."
                        : ""
                    }
                    value={texts[locale].body}
                    onChange={(e) => setText(locale, "body", e.target.value)}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-end">
            <Button
              disabled={!canSend}
              onClick={() => (target === "all" ? setConfirmOpen(true) : handleSend())}
            >
              <Send className="h-4 w-4 mr-1" />
              {target === "all" ? "Send to All Guests" : "Send Notification"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent Notifications</CardTitle>
          <CardDescription>The 50 most recent staff-sent notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No notifications sent yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sent</TableHead>
                  <TableHead>Notification</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-right">Devices</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(n.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{n.body}</div>
                    </TableCell>
                    <TableCell>
                      {n.target === "all" ? (
                        <Badge variant="secondary">All guests</Badge>
                      ) : (
                        <span className="text-sm">{n.targetLabel}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{n.sentCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{n.sentBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to all in-house guests?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{texts.en.title}&rdquo; will be pushed to {totalDevices} device
              {totalDevices === 1 ? "" : "s"} across {subscribedGuests} guest
              {subscribedGuests === 1 ? "" : "s"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Send Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
