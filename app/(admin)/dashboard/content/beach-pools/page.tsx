"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves, Umbrella, Clock, Info } from "lucide-react"

const INITIAL = {
  beachDescription:
    "Our private beach stretches 500 meters along the Mediterranean coast, offering crystal-clear waters and pristine white sand. Sunbeds and umbrellas are complimentary for all guests.",
  beachHours: "07:00 – 19:00",
  beachNotes:
    "Beach towels available at the beach bar. Water sports equipment rental available from 09:00 to 17:00.",
  mainPoolDescription:
    "Our main outdoor pool is the heart of the resort, featuring a spacious swimming area, a children's splash zone, and a poolside bar.",
  mainPoolHours: "07:00 – 20:00",
  indoorPoolDescription:
    "The indoor heated pool is available year-round and is perfect for early morning swims or cooler evenings.",
  indoorPoolHours: "06:00 – 22:00",
  kidsPoolDescription:
    "A dedicated shallow pool for children with water features and slides, supervised by our trained staff.",
  kidsPoolHours: "09:00 – 18:00",
  generalNotes:
    "Pool towels are available at the pool deck. Food and beverages can be ordered directly to your sunbed. Please shower before entering pools.",
}

export default function BeachPoolsAdminPage() {
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)

  function set(key: keyof typeof INITIAL) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
    toast.success("Beach & Pools information saved")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Beach & Pools</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage beach and pool descriptions, hours, and notes
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {/* Beach */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Umbrella className="h-4 w-4" />
            Private Beach
          </CardTitle>
          <CardDescription>Information displayed on the beach & pools page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.beachDescription} onChange={set("beachDescription")} rows={3} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Opening Hours
              </Label>
              <Input value={form.beachHours} onChange={set("beachHours")} placeholder="07:00 – 19:00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Notes
            </Label>
            <Textarea value={form.beachNotes} onChange={set("beachNotes")} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Main Pool */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Main Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.mainPoolDescription} onChange={set("mainPoolDescription")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Opening Hours
            </Label>
            <Input value={form.mainPoolHours} onChange={set("mainPoolHours")} placeholder="07:00 – 20:00" />
          </div>
        </CardContent>
      </Card>

      {/* Indoor Pool */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Indoor Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.indoorPoolDescription} onChange={set("indoorPoolDescription")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Opening Hours
            </Label>
            <Input value={form.indoorPoolHours} onChange={set("indoorPoolHours")} placeholder="06:00 – 22:00" />
          </div>
        </CardContent>
      </Card>

      {/* Kids Pool */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Kids Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.kidsPoolDescription} onChange={set("kidsPoolDescription")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Opening Hours
            </Label>
            <Input value={form.kidsPoolHours} onChange={set("kidsPoolHours")} placeholder="09:00 – 18:00" />
          </div>
        </CardContent>
      </Card>

      {/* General Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            General Notes & Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={form.generalNotes} onChange={set("generalNotes")} rows={4} />
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
