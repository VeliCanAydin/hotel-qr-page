'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BedSingle, Clock4, ShowerHead, Sparkles, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createGuestQuickRequest, type QuickRequestKey } from '@/lib/actions/support-requests'

const REQUESTS: { key: QuickRequestKey; label: string; icon: LucideIcon }[] = [
  { key: 'towels', label: 'Extra towels', icon: ShowerHead },
  { key: 'cleaning', label: 'Room cleaning', icon: Sparkles },
  { key: 'toiletries', label: 'Toiletries refill', icon: BedSingle },
  { key: 'late-checkout', label: 'Late checkout', icon: Clock4 },
]

export function QuickRequests() {
  const [pending, setPending] = useState<(typeof REQUESTS)[number] | null>(null)
  const [note, setNote] = useState('')
  const [isSending, setIsSending] = useState(false)

  function openConfirm(request: (typeof REQUESTS)[number]) {
    setNote('')
    setPending(request)
  }

  async function handleSend() {
    if (!pending) return
    setIsSending(true)
    try {
      const result = await createGuestQuickRequest(pending.key, note)
      if ('error' in result) {
        toast.info(result.error)
      } else {
        toast.success(`Request sent — our team has been notified.`)
      }
      setPending(null)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="gap-3">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-l font-bold">Quick Requests</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {REQUESTS.map((request) => (
            <Button
              key={request.key}
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3"
              onClick={() => openConfirm(request)}
            >
              <request.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{request.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!pending} onOpenChange={(open) => !open && !isSending && setPending(null)}>
        {pending && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{pending.label}</DialogTitle>
              <DialogDescription>
                We&apos;ll notify our team for your room right away.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="quick-request-note">Note (optional)</Label>
              <Textarea
                id="quick-request-note"
                placeholder="Anything we should know?"
                rows={2}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPending(null)} disabled={isSending}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={isSending}>
                {isSending ? 'Sending…' : 'Send request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  )
}
