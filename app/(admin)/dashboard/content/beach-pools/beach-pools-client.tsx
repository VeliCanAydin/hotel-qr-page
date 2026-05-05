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

type FormState = {
  [K in keyof BeachPoolsInfoData]: BeachPoolsInfoData[K] extends string | null ? string : BeachPoolsInfoData[K]
}

function toFormState(data: BeachPoolsInfoData): FormState {
  return {
    beachDescription: data.beachDescription,
    beachOpenTime: data.beachOpenTime?.slice(0, 5) ?? '',
    beachCloseTime: data.beachCloseTime?.slice(0, 5) ?? '',
    beachNotes: data.beachNotes,
    mainPoolDescription: data.mainPoolDescription,
    mainPoolOpenTime: data.mainPoolOpenTime?.slice(0, 5) ?? '',
    mainPoolCloseTime: data.mainPoolCloseTime?.slice(0, 5) ?? '',
    indoorPoolDescription: data.indoorPoolDescription,
    indoorPoolOpenTime: data.indoorPoolOpenTime?.slice(0, 5) ?? '',
    indoorPoolCloseTime: data.indoorPoolCloseTime?.slice(0, 5) ?? '',
    kidsPoolDescription: data.kidsPoolDescription,
    kidsPoolOpenTime: data.kidsPoolOpenTime?.slice(0, 5) ?? '',
    kidsPoolCloseTime: data.kidsPoolCloseTime?.slice(0, 5) ?? '',
    generalNotes: data.generalNotes,
  }
}

export default function BeachPoolsClient({ initialData }: { initialData: BeachPoolsInfoData }) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialData))

  function set(key: keyof FormState) {
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
    <div className="grid grid-cols-1 gap-4 max-w-5xl md:grid-cols-2">
      <div className="flex items-center justify-between col-span-full">
        <div>
          <h1 className="text-2xl font-semibold">Beach & Pools</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage beach and pool descriptions, hours, and notes
          </p>
        </div>
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
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Opening Hours
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Open</Label>
                <Input type="time" value={form.beachOpenTime} onChange={set("beachOpenTime")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Close</Label>
                <Input type="time" value={form.beachCloseTime} onChange={set("beachCloseTime")} />
              </div>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Open</Label>
                <Input type="time" value={form.mainPoolOpenTime} onChange={set("mainPoolOpenTime")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Close</Label>
                <Input type="time" value={form.mainPoolCloseTime} onChange={set("mainPoolCloseTime")} />
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Open</Label>
                <Input type="time" value={form.indoorPoolOpenTime} onChange={set("indoorPoolOpenTime")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Close</Label>
                <Input type="time" value={form.indoorPoolCloseTime} onChange={set("indoorPoolCloseTime")} />
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Open</Label>
                <Input type="time" value={form.kidsPoolOpenTime} onChange={set("kidsPoolOpenTime")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Close</Label>
                <Input type="time" value={form.kidsPoolCloseTime} onChange={set("kidsPoolCloseTime")} />
              </div>
            </div>
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

      <div className="flex justify-end col-span-full">
        <Button onClick={handleSave} size="lg">Save All Changes</Button>
      </div>
    </div>
  )
}
