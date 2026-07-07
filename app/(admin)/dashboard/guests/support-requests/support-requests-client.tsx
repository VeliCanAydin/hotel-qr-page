"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { format, isToday, parseISO, isValid } from "date-fns"
import { CalendarDays, ChevronDown, Clock3, MessageSquareText, Search, UsersRound } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { GuestSupportRequest } from "@/lib/actions/support-requests"

type ServerRequest = GuestSupportRequest & { createdAtFormatted?: string }
type Props = { initialRequests: ServerRequest[]; totalCount: number; limit: number }

const TYPE_LABELS: Record<string, string> = {
  support: 'Support',
  complaint: 'Complaint',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
}

function formatDateLabel(date: Date) {
  return isToday(date) ? 'Today' : format(date, 'EEEE, d MMMM yyyy')
}

function formatDateTime(date: Date) {
  return `${format(date, 'dd/MM/yyyy')} · ${format(date, 'HH:mm')}`
}

function formatCreatedAt(value: string) {
  const parsed = parseISO(value)
  if (isValid(parsed)) return formatDateTime(parsed)
  const fallback = new Date(value)
  if (isValid(fallback)) return formatDateTime(fallback)
  return value
}

function formatGroupDate(value: string) {
  const parsed = parseISO(value)
  if (isValid(parsed)) return formatDateLabel(parsed)
  const fallback = new Date(value)
  if (isValid(fallback)) return formatDateLabel(fallback)
  return value
}

function truncateText(value: string, maxLength: number) {
  const text = value.trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function SupportRequestCard({
  request,
  onOpen,
  onPreviewAttachment,
}: {
  request: ServerRequest
  onOpen: (request: ServerRequest) => void
  onPreviewAttachment: (imageUrl: string) => void
}) {
  const guestLabel = request.guestName || 'Anonymous guest'
  const createdLabel = request.createdAtFormatted ?? formatCreatedAt(String(request.createdAt))
  const subjectPreview = truncateText(request.subject, 90) || 'No subject provided.'
  const messagePreview = truncateText(request.message, 120) || 'No message provided.'
  const hasAttachment = Boolean(request.imageUrl)

  return (
    <details className="group rounded-xl border border-border/70 bg-card/80 shadow-sm transition-shadow open:shadow-md">
      <summary className="cursor-pointer list-none p-4 outline-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {guestLabel.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'G'}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-base font-semibold leading-none">{guestLabel}</div>
                  {request.roomNumber ? <Badge variant="outline">Room {request.roomNumber}</Badge> : null}
                  <Badge variant="secondary" className="gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {TYPE_LABELS[request.requestType] ?? request.requestType}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 capitalize">
                    <UsersRound className="size-3.5" />
                    {STATUS_LABELS[request.status] ?? request.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                  <span>{createdLabel}</span>
                  <span>·</span>
                  <span>#{request.id}</span>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Subject</div>
                    <p className="mt-1 truncate text-sm text-foreground/90" title={request.subject}>{subjectPreview}</p>
                  </div>
                  <div className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-destructive">Message</div>
                    <p className="mt-1 truncate text-sm text-foreground/90" title={request.message}>{messagePreview}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
            <Badge variant="outline" className={cn('gap-1.5 font-semibold', request.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : request.status === 'in-progress' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300' : 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300')}>
              <Clock3 className="size-3.5" />
              {STATUS_LABELS[request.status] ?? request.status}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              <span>{createdLabel}</span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </div>
        </div>
      </summary>

      <div className="border-t px-4 pb-4 pt-0 sm:px-5">
        <div className="space-y-4 pt-4">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Request Details</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Type</dt>
              <dd>{TYPE_LABELS[request.requestType] ?? request.requestType}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{STATUS_LABELS[request.status] ?? request.status}</dd>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="capitalize">{request.issueCategory.replace(/-/g, ' ')}</dd>
              <dt className="text-muted-foreground">Room</dt>
              <dd>{request.roomNumber || '—'}</dd>
            </dl>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Full subject</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{request.subject || 'No subject provided.'}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Full message</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{request.message || 'No message provided.'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpen(request)}>Open Request</Button>
            {hasAttachment ? (
              <Button variant="outline" size="sm" onClick={() => onPreviewAttachment(request.imageUrl)}>
                View Attachment
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </details>
  )
}

export default function SupportRequestsClient({ initialRequests, totalCount, limit }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<"all" | "support" | "complaint">('all')
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in-progress" | "resolved">('all')
  const [detail, setDetail] = useState<ServerRequest | null>(null)
  const [requests, setRequests] = useState<ServerRequest[]>(initialRequests)

  // Poll for new requests; sync local state when the server sends fresh data
  // and announce records we haven't seen in this session. Compared by highest
  // known id so "Load older" pages don't announce old requests as new.
  useAutoRefresh(30_000)
  const maxKnownRequestId = useRef<number | null>(null)
  useEffect(() => {
    setRequests(initialRequests)

    const previousMax = maxKnownRequestId.current
    maxKnownRequestId.current = Math.max(0, ...initialRequests.map((r) => r.id))
    if (previousMax === null) return

    const fresh = initialRequests.filter((r) => r.id > previousMax)
    if (fresh.length === 1) {
      toast.info(`New ${TYPE_LABELS[fresh[0].requestType]?.toLowerCase() ?? 'request'} — Room ${fresh[0].roomNumber || '?'}`, {
        description: fresh[0].subject,
      })
    } else if (fresh.length > 1) {
      toast.info(`${fresh.length} new support requests received`)
    }
  }, [initialRequests])
  const [saving, setSaving] = useState(false)
  const [staffResponseText, setStaffResponseText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<"open" | "in-progress" | "resolved">('open')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return requests.filter((r) => {
      if (typeFilter !== 'all' && r.requestType !== typeFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      )
    })
  }, [requests, search, typeFilter, statusFilter])

  const grouped = useMemo(() => {
    const groups = new Map<string, ServerRequest[]>()
    for (const request of filtered) {
      const createdValue = request.createdAtFormatted ?? String(request.createdAt)
      const key = formatGroupDate(createdValue)
      const existing = groups.get(key) ?? []
      existing.push(request)
      groups.set(key, existing)
    }
    return Array.from(groups.entries())
  }, [filtered])

  async function saveResponse(id: number, staffResponse: string, status: string): Promise<ServerRequest | null> {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/support-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffResponse, status }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      const updated = data.request as ServerRequest
      setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setDetail(updated)
      setStaffResponseText(updated.staffResponse ?? '')
      setSelectedStatus((updated.status as any) ?? 'open')
      return updated
    } catch (error) {
      console.error(error)
      toast.error('Failed to save response')
      return null
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Support & Complaints</h1>
          <p className="text-sm text-muted-foreground">Guest support requests and complaints from the QR support form.</p>
        </div>

        <div className="flex w-full max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, room, subject or message..."
              className="pl-9"
            />
          </div>
          <Button
            size="sm"
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/support-requests/export')
                if (!res.ok) throw new Error('Could not generate report')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'support-requests.xlsx'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
                toast.success('Excel report downloaded')
              } catch (error) {
                toast.error((error as Error).message || 'Report generation failed')
              }
            }}
          >
            Export Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={(value) => setTypeFilter(value as any)}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Type: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-44 h-8">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">Total {requests.length}</Badge>
          <Badge variant="outline">Filtered {filtered.length}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        {grouped.length ? grouped.map(([dateKey, entries]) => {
          const groupDate = entries[0]?.createdAtFormatted ?? String(entries[0]?.createdAt ?? dateKey)
          return (
            <section key={dateKey} className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold sm:text-lg">{dateKey}</h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">{entries.length} submission{entries.length > 1 ? 's' : ''} · Latest {formatCreatedAt(groupDate)}</p>
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
                {entries.map((request) => (
                  <SupportRequestCard
                    key={request.id}
                    request={request}
                    onOpen={(item) => {
                      setDetail(item)
                      setStaffResponseText(item.staffResponse ?? '')
                      setSelectedStatus((item.status as any) ?? 'open')
                    }}
                    onPreviewAttachment={(imageUrl) => setImagePreview(imageUrl)}
                  />
                ))}
              </div>
            </section>
          )
        }) : (
          <div className="rounded-2xl border border-dashed bg-card/60 p-10 text-center text-sm text-muted-foreground">
            <MessageSquareText className="mx-auto mb-2 size-5" />
            <p>No support requests matched your search.</p>
          </div>
        )}
      </div>

      {totalCount > initialRequests.length && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">
            Showing the latest {initialRequests.length} of {totalCount} requests
          </span>
          <Button variant="outline" size="sm" onClick={() => router.replace(`?limit=${limit + 100}`)}>
            Load older
          </Button>
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        {detail && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{detail.subject}</DialogTitle>
              <DialogDescription>
                {TYPE_LABELS[detail.requestType] ?? detail.requestType} · {detail.issueCategory} · Room {detail.roomNumber || '—'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="text-sm">{detail.message}</p>
              </div>

              {detail.imageUrl && (
                <div>
                  <p className="text-sm text-muted-foreground">Attachment</p>
                  <img
                    src={detail.imageUrl}
                    alt="attachment"
                    className="max-h-48 rounded-md cursor-pointer"
                    onClick={() => setImagePreview(detail.imageUrl)}
                  />
                </div>
              )}

              <Separator />

              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Request Info</p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{TYPE_LABELS[detail.requestType] ?? detail.requestType}</dd>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{STATUS_LABELS[detail.status] ?? detail.status}</dd>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{detail.createdAtFormatted ?? formatCreatedAt(String(detail.createdAt))}</dd>
                  <dt className="text-muted-foreground">Room</dt>
                  <dd>{detail.roomNumber || '—'}</dd>
                </dl>
              </div>

              <Separator />

              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Staff Response</p>
                <Textarea value={staffResponseText} onChange={(event) => setStaffResponseText(event.target.value)} id="staffResponse" />
                <div className="mt-2 flex items-center gap-2">
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
                    <SelectTrigger className="w-44 h-8">
                      <SelectValue placeholder={selectedStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
              <Button
                onClick={async () => {
                  const updated = await saveResponse(detail.id, staffResponseText, selectedStatus)
                  if (updated) setDetail(null)
                }}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Response'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!imagePreview} onOpenChange={(open) => !open && setImagePreview(null)}>
        {imagePreview && (
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Attachment Preview</DialogTitle>
              <DialogDescription>
                Click outside or press Escape to close the preview.
              </DialogDescription>
            </DialogHeader>
            <img src={imagePreview} alt="preview" className="mx-auto max-h-[80vh] w-auto" />
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
