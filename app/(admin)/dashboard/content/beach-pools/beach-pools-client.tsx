"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves, Umbrella, Clock, Info } from "lucide-react"
import { updateBeachPoolsInfo, type BeachPoolsInfoData } from "@/lib/actions/beach-pools"

export default function BeachPoolsClient({ initialData }: { initialData: BeachPoolsInfoData }) {
  const [form, setForm] = useState(initialData)

  function set(key: keyof BeachPoolsInfoData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))
  }

  function handleSave() {
    toast.promise(updateBeachPoolsInfo(form), {
      loading: "Saving...",
      success: "Beach & Pools information saved",
      error: "Failed to save",
    })
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
        <Button onClick={handleSave}>Save All Changes</Button>
      </div>

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
        <Button onClick={handleSave} size="lg">Save All Changes</Button>
      </div>
    </div>
  )
}
