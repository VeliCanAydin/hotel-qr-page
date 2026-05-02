"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MessageCircle, Wifi, Clock, FileText } from "lucide-react"

type HotelInfoForm = {
  phone: string
  email: string
  whatsapp: string
  wifiName: string
  wifiPassword: string
  checkInStart: string
  checkInEnd: string
  checkOut: string
  cancellationPolicy: string
  aboutText: string
}

const EMPTY: HotelInfoForm = {
  phone: "",
  email: "",
  whatsapp: "",
  wifiName: "",
  wifiPassword: "",
  checkInStart: "",
  checkInEnd: "",
  checkOut: "",
  cancellationPolicy: "",
  aboutText: "",
}

export default function HotelInfoAdminPage() {
  const [form, setForm] = useState<HotelInfoForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/hotel-info")
      .then((r) => r.json())
      .then((data) => {
        if (data) setForm(data)
      })
      .finally(() => setLoading(false))
  }, [])

  function set(key: keyof HotelInfoForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/hotel-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Hotel information saved successfully")
    } catch {
      toast.error("Failed to save hotel information")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hotel Info</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage contact information, WiFi settings, and hotel policies
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            About the Hotel
          </CardTitle>
          <CardDescription>Welcome text displayed on the hotel info page</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={form.aboutText} onChange={set("aboutText")} rows={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
          <CardDescription>Guest-facing contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone
              </Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </Label>
              <Input id="whatsapp" value={form.whatsapp} onChange={set("whatsapp")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Wi-Fi Settings
          </CardTitle>
          <CardDescription>Guest network credentials shown in hotel info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wifi-name">Network Name (SSID)</Label>
              <Input id="wifi-name" value={form.wifiName} onChange={set("wifiName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi-pass">Password</Label>
              <Input id="wifi-pass" value={form.wifiPassword} onChange={set("wifiPassword")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Check-In &amp; Check-Out
          </CardTitle>
          <CardDescription>Policy times displayed to guests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin-start">Check-In From</Label>
              <Input id="checkin-start" type="time" value={form.checkInStart} onChange={set("checkInStart")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkin-end">Check-In Until</Label>
              <Input id="checkin-end" type="time" value={form.checkInEnd} onChange={set("checkInEnd")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout">Check-Out By</Label>
              <Input id="checkout" type="time" value={form.checkOut} onChange={set("checkOut")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cancellation Policy
          </CardTitle>
          <CardDescription>Policy text shown in the accordion on hotel info page</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={form.cancellationPolicy} onChange={set("cancellationPolicy")} rows={4} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
