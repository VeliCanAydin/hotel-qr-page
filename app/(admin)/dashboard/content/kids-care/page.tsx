"use client"

import { useState, useMemo } from "react"
import { weeklySchedule } from "@/lib/data/kidsClubData"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Activity = { time: string; event: string }
type DaySchedule = { day: string; activities: Activity[] }

const DAYS = weeklySchedule.map((d) => d.day)

export default function KidsCareAdminPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    weeklySchedule.map((d) => ({ ...d, activities: d.activities.map((a) => ({ ...a })) }))
  )
  const [activeDay, setActiveDay] = useState("Monday")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ day: string; time: string } | null>(null)
  const [editingActivity, setEditingActivity] = useState<(Activity & { day: string }) | null>(null)
  const [form, setForm] = useState<Activity>({ time: "10:00", event: "" })

  const currentDay = useMemo(
    () => schedule.find((d) => d.day === activeDay)!,
    [schedule, activeDay]
  )

  function openAdd() {
    setEditingActivity(null)
    setForm({ time: "10:00", event: "" })
    setDialogOpen(true)
  }

  function openEdit(activity: Activity) {
    setEditingActivity({ ...activity, day: activeDay })
    setForm({ time: activity.time, event: activity.event })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.event.trim() || !form.time) return
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== activeDay) return d
        if (editingActivity) {
          return {
            ...d,
            activities: d.activities.map((a) =>
              a.time === editingActivity.time && a.event === editingActivity.event ? { ...form } : a
            ),
          }
        } else {
          const exists = d.activities.some((a) => a.time === form.time)
          if (exists) {
            toast.error("An activity already exists at this time")
            return d
          }
          const newActivities = [...d.activities, { ...form }].sort((a, b) =>
            a.time.localeCompare(b.time)
          )
          return { ...d, activities: newActivities }
        }
      })
    )
    if (editingActivity) {
      toast.success("Activity updated")
    } else {
      toast.success("Activity added")
    }
    setDialogOpen(false)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== deleteTarget.day) return d
        return {
          ...d,
          activities: d.activities.filter((a) => a.time !== deleteTarget.time),
        }
      })
    )
    setDeleteTarget(null)
    toast.success("Activity removed")
  }

  const activeCount = currentDay.activities.filter((a) => a.event !== "Closed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kids Care Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the weekly kids club activity schedule
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="flex-wrap h-auto gap-1">
          {DAYS.map((day) => {
            const count = schedule.find((d) => d.day === day)?.activities.filter((a) => a.event !== "Closed").length ?? 0
            return (
              <TabsTrigger key={day} value={day} className="gap-1.5">
                {day.slice(0, 3)}
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  {count}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={activeDay} className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="w-[90px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDay.activities.map((activity) => (
                  <TableRow key={`${activity.time}-${activity.event}`}>
                    <TableCell className="font-mono text-sm font-medium tabular-nums">
                      {activity.time}
                    </TableCell>
                    <TableCell>
                      {activity.event === "Closed" ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Closed
                        </Badge>
                      ) : (
                        activity.event
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(activity)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget({ day: activeDay, time: activity.time })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {currentDay.activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                      No activities scheduled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {activeDay}: {activeCount} active activities
          </p>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Edit Activity" : `Add Activity — ${activeDay}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="act-time">Time</Label>
              <Input
                id="act-time"
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-event">Activity Name</Label>
              <Input
                id="act-event"
                value={form.event}
                onChange={(e) => setForm((p) => ({ ...p, event: e.target.value }))}
                placeholder="e.g. Pool Game"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.event.trim() || !form.time}>
              {editingActivity ? "Save Changes" : "Add Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the activity at {deleteTarget?.time} from {deleteTarget?.day}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
