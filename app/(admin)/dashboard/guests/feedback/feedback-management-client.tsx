'use client'

import { useMemo, useState } from 'react'
import { format, isToday } from 'date-fns'
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  MessageSquareText,
  Search,
  Star,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { GuestFeedback } from '@/lib/actions/feedback'

const TRIP_TYPE_LABELS: Record<string, string> = {
  business: 'Business',
  leisure: 'Leisure',
  family: 'Family',
  solo: 'Solo',
  couple: 'Couple',
}

function formatDateLabel(date: Date) {
  return isToday(date) ? 'Today' : format(date, 'EEEE, d MMMM yyyy')
}

function formatDateTime(date: Date) {
  return `${format(date, 'dd/MM/yyyy')} · ${format(date, 'HH:mm')}`
}

function formatResponseTime(date: Date | null | undefined) {
  if (!date) {
    return ''
  }

  return format(date, 'dd/MM/yyyy · HH:mm')
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (!parts.length) {
    return 'G'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function truncateText(value: string, maxLength: number) {
  const text = value.trim()

  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function hasStaffResponse(feedback: GuestFeedback) {
  return Boolean(feedback.staffActionNote.trim())
}

function renderStars(value: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={cn(
        'size-3.5',
        index < value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
      )}
    />
  ))
}

function scoreTone(value: number) {
  if (value <= 2) {
    return 'bg-destructive/10 text-destructive border-destructive/20'
  }

  if (value === 3) {
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300'
  }

  return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300'
}

function FeedbackResponseEditor({ feedback }: { feedback: GuestFeedback }) {
  const [staffActionNote, setStaffActionNote] = useState(feedback.staffActionNote)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const responseSaved = hasStaffResponse(feedback)
  const responseAuthor = feedback.staffResponseBy.trim()
  const responseTime = formatResponseTime(feedback.staffResponseAt)

  async function handleSave() {
    const trimmedActionNote = staffActionNote.trim()

    if (!trimmedActionNote) {
      setError('Add an internal note before saving.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/guest-feedback/${feedback.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffActionNote: trimmedActionNote,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { feedback?: GuestFeedback; error?: string }
        | null

      if (!response.ok || !payload?.feedback) {
        throw new Error(payload?.error || 'Could not save response')
      }

      setStaffActionNote(payload.feedback.staffActionNote)
      toast.success('Internal note saved')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save response')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">Staff response (internal)</div>
          <p className="text-xs text-muted-foreground">
            Record an internal staff response and the action taken. This will not be sent to the guest.
          </p>
        </div>
        <Badge variant={responseSaved ? 'secondary' : 'outline'}>
          {responseSaved ? 'Saved' : 'Pending'}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Internal note
          </div>
          <Textarea
            value={staffActionNote}
            onChange={(event) => setStaffActionNote(event.target.value)}
            rows={6}
            placeholder="Example: Guest reported room AC instability. Maintenance ticket opened and duty engineer informed."
          />
        </div>

      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {responseAuthor || responseTime
            ? `Last saved ${[responseAuthor, responseTime].filter(Boolean).join(' · ')}`
            : 'This feedback has not been answered yet.'}
        </p>
        <div className="flex items-center gap-2">
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save internal note'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeedbackRow({ feedback }: { feedback: GuestFeedback }) {
  const guestLabel = feedback.guestName || 'Anonymous guest'
  const contactLabel = [feedback.roomNumber && `Room ${feedback.roomNumber}`, feedback.email].filter(Boolean).join(' · ')
  const tripLabel = feedback.tripType ? TRIP_TYPE_LABELS[feedback.tripType] ?? feedback.tripType : 'Unspecified'
  const needsFollowUp = feedback.overallRating <= 3 || Boolean(feedback.negative.trim())
  const replySaved = hasStaffResponse(feedback)
  const positivePreview = truncateText(feedback.positive, 110) || 'No positive note added.'
  const negativePreview = truncateText(feedback.negative, 110) || 'No issue reported.'
  const initials = getInitials(guestLabel)

  return (
    <details className="group rounded-xl border border-border/70 bg-card/80 shadow-sm transition-shadow open:shadow-md">
      <summary className="cursor-pointer list-none p-4 outline-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base leading-none">{guestLabel}</CardTitle>
                  {feedback.roomNumber ? <Badge variant="outline">Room {feedback.roomNumber}</Badge> : null}
                  <Badge variant="secondary" className="gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {tripLabel}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <UsersRound className="size-3.5" />
                    {feedback.consent ? 'Approved' : 'Private'}
                  </Badge>
                  <Badge variant={replySaved ? 'secondary' : 'outline'}>{replySaved ? 'Responded' : 'Awaiting reply'}</Badge>
                  {needsFollowUp ? <Badge variant="destructive">Follow-up</Badge> : null}
                </div>

                <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                  {contactLabel ? <span>{contactLabel}</span> : null}
                  {feedback.stayFrom || feedback.stayTo ? (
                    <span>
                      Stay {feedback.stayFrom || '—'}{feedback.stayTo ? ` → ${feedback.stayTo}` : ''}
                    </span>
                  ) : null}
                </CardDescription>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Positive
                    </div>
                    <p className="mt-1 truncate text-sm text-foreground/90" title={feedback.positive.trim()}>
                      {positivePreview}
                    </p>
                  </div>
                  <div className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-destructive">
                      Attention
                    </div>
                    <p className="mt-1 truncate text-sm text-foreground/90" title={feedback.negative.trim()}>
                      {negativePreview}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
            <Badge variant="outline" className={cn('gap-1.5 font-semibold', scoreTone(feedback.overallRating))}>
              <Star className="size-3.5 fill-current" />
              {feedback.overallRating}/5
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              <span>{formatDateTime(feedback.createdAt)}</span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </div>
        </div>
      </summary>

      <CardContent className="space-y-4 border-t px-4 pb-4 pt-0 sm:px-5">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['Cleanliness', feedback.cleanlinessRating],
            ['Staff', feedback.staffRating],
            ['Comfort', feedback.comfortRating],
            ['Value', feedback.valueRating],
            ['Food', feedback.foodRating],
            ['NPS', feedback.npsScore ?? null],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-muted/20 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                {value === null ? (
                  <span className="text-muted-foreground">Not rated</span>
                ) : label === 'NPS' ? (
                  <span>{value}/10</span>
                ) : (
                  <>
                    <span>{value}/5</span>
                    <span className="flex items-center gap-0.5">{renderStars(value as number)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-emerald-500/5 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Full positive note
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {feedback.positive.trim() || 'No positive note added.'}
            </p>
          </div>
          <div className="rounded-lg border bg-destructive/5 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-destructive">
              Full attention note
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {feedback.negative.trim() || 'No issue reported.'}
            </p>
          </div>
        </div>

        <FeedbackResponseEditor feedback={feedback} />
      </CardContent>
    </details>
  )
}

export default function FeedbackManagementClient({ initialFeedbacks }: { initialFeedbacks: GuestFeedback[] }) {
  const [search, setSearch] = useState('')

  const filteredFeedbacks = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return initialFeedbacks
    }

    return initialFeedbacks.filter((feedback) => {
      const haystack = [
        feedback.guestName,
        feedback.email,
        feedback.roomNumber,
        feedback.tripType,
        feedback.positive,
        feedback.negative,
        feedback.staffResponse,
        feedback.staffActionNote,
        feedback.staffResponseBy,
        feedback.stayFrom,
        feedback.stayTo,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [initialFeedbacks, search])

  const groupedFeedbacks = useMemo(() => {
    const groups = new Map<string, GuestFeedback[]>()

    for (const feedback of filteredFeedbacks) {
      const key = format(feedback.createdAt, 'yyyy-MM-dd')
      const existing = groups.get(key) ?? []
      existing.push(feedback)
      groups.set(key, existing)
    }

    return Array.from(groups.entries())
  }, [filteredFeedbacks])

  const totalCount = initialFeedbacks.length
  const todayCount = initialFeedbacks.filter((feedback) => isToday(feedback.createdAt)).length
  const averageRating = totalCount
    ? (initialFeedbacks.reduce((sum, feedback) => sum + feedback.overallRating, 0) / totalCount).toFixed(1)
    : '0.0'
  const followUpCount = initialFeedbacks.filter(
    (feedback) => feedback.overallRating <= 3 || Boolean(feedback.negative.trim())
  ).length

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Guest Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Daily ratings, guest notes and staff responses to complaints from the QR feedback form.
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search guest, room, email or comment..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/guest-feedback/report')
                if (!res.ok) throw new Error('Could not generate report')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `guest-feedback-report.xlsx`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
                toast.success('Excel report downloaded')
              } catch (err) {
                toast.error((err as Error).message || 'Report generation failed')
              }
            }}
          >
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total feedback', value: totalCount, description: 'All submitted reviews' },
          { label: 'Today', value: todayCount, description: 'Feedbacks submitted today' },
          { label: 'Average rating', value: averageRating, description: 'Overall score across all guests' },
          { label: 'Follow-ups', value: followUpCount, description: 'Low ratings or negative notes' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/70 bg-card/80">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{stat.description}</CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="space-y-6">
        {groupedFeedbacks.length ? (
          groupedFeedbacks.map(([dateKey, entries]) => {
            const groupDate = entries[0]?.createdAt ?? new Date(dateKey)
            const groupAverage = (entries.reduce((sum, feedback) => sum + feedback.overallRating, 0) / entries.length).toFixed(1)

            return (
              <section key={dateKey} className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold sm:text-lg">{formatDateLabel(groupDate)}</h2>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {entries.length} submission{entries.length > 1 ? 's' : ''} · Average {groupAverage}/5
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1.5">
                      <Clock3 className="size-3.5" />
                      {dateKey}
                    </Badge>
                    <Badge variant="secondary">{entries.length} items</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {entries.map((feedback) => (
                    <FeedbackRow key={feedback.id} feedback={feedback} />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <MessageSquareText className="size-5" />
              <p>No feedback matched your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
