'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Star,
  BrushCleaning,
  UsersRound,
  Bed,
  UtensilsCrossed,
  Send,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

const CATEGORIES = [
  { key: 'cleanliness', icon: BrushCleaning },
  { key: 'staff', icon: UsersRound },
  { key: 'comfort', icon: Bed },
  { key: 'food', icon: UtensilsCrossed },
] as const

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="size-10 transition-transform hover:scale-110 active:scale-95"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              'w-full h-full transition-colors',
              (hover || value) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function GuestFeedbackForm({
  guestName,
  roomNumber,
}: {
  guestName: string
  roomNumber: string
}) {
  const t = useTranslations('portal')
  const [overall, setOverall] = useState(0)
  const [categories, setCategories] = useState({
    cleanliness: 3,
    staff: 3,
    comfort: 3,
    food: 3,
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t('thankYou')}</p>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              {t('thankYouDesc')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            {t('submitAnother')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Guest context */}
      <p className="text-xs text-muted-foreground">
        {t('submittingAs', { name: guestName, room: roomNumber })}
      </p>

      {/* Overall rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('overallExperience')}</CardTitle>
          <CardDescription>{t('overallDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <StarRating value={overall} onChange={setOverall} />
        </CardContent>
      </Card>

      {overall > 0 && (
        <>
          {/* Category ratings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('rateByCategory')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {CATEGORIES.map(({ key, icon: Icon }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-36 shrink-0">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm">{t(`fbCategories.${key}`)}</span>
                  </div>
                  <Slider
                    value={[categories[key as keyof typeof categories]]}
                    onValueChange={([v]) =>
                      setCategories((prev) => ({ ...prev, [key]: v }))
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold w-4 text-center">
                    {categories[key as keyof typeof categories]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('anyComments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="comment" className="sr-only">{t('anyComments')}</Label>
                <Textarea
                  id="comment"
                  placeholder={t('commentPlaceholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || overall === 0}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                {t('submitting')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="size-4" />
                {t('submitFeedback')}
              </span>
            )}
          </Button>
        </>
      )}
    </form>
  )
}
