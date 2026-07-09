'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Languages, Loader2, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { TRANSLATABLE_ENTITIES, type TranslatableEntityType } from '@/lib/i18n-entities'
import {
  getTranslationEntries,
  saveTranslations,
  type TranslationChange,
  type TranslationSourceRow,
} from '@/lib/actions/translations'

const TARGET_LOCALES = [
  { value: 'tr', label: 'Türkçe (TR)' },
  { value: 'de', label: 'Deutsch (DE)' },
  { value: 'ru', label: 'Русский (RU)' },
] as const

const ENTITY_OPTIONS = Object.entries(TRANSLATABLE_ENTITIES).map(([value, meta]) => ({
  value: value as TranslatableEntityType,
  label: meta.label,
}))

// cancellationPolicy -> "Cancellation Policy"
function fieldLabel(field: string) {
  const spaced = field.replace(/([A-Z])/g, ' $1')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const cellKey = (entityId: string, field: string) => `${entityId}::${field}`

type Props = {
  initialEntityType: TranslatableEntityType
  initialLocale: string
  initialEntries: TranslationSourceRow[]
}

export default function TranslationsClient({ initialEntityType, initialLocale, initialEntries }: Props) {
  const [entityType, setEntityType] = useState<TranslatableEntityType>(initialEntityType)
  const [locale, setLocale] = useState<string>(initialLocale)
  const [entries, setEntries] = useState<TranslationSourceRow[]>(initialEntries)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [isLoading, startLoading] = useTransition()
  const [isSaving, setIsSaving] = useState(false)

  function loadEntries(nextEntityType: TranslatableEntityType, nextLocale: string) {
    startLoading(async () => {
      try {
        const rows = await getTranslationEntries(nextEntityType, nextLocale)
        setEntries(rows)
        setEdits({})
      } catch {
        toast.error('Failed to load translations')
      }
    })
  }

  function handleEntityTypeChange(value: string) {
    const next = value as TranslatableEntityType
    setEntityType(next)
    loadEntries(next, locale)
  }

  function handleLocaleChange(value: string) {
    setLocale(value)
    loadEntries(entityType, value)
  }

  const dirtyChanges = useMemo<TranslationChange[]>(() => {
    const changes: TranslationChange[] = []
    for (const row of entries) {
      for (const cell of row.fields) {
        const edited = edits[cellKey(row.entityId, cell.field)]
        if (edited !== undefined && edited !== cell.value) {
          changes.push({ entityId: row.entityId, field: cell.field, value: edited })
        }
      }
    }
    return changes
  }, [entries, edits])

  const missingCount = useMemo(() => {
    let count = 0
    for (const row of entries) {
      for (const cell of row.fields) {
        const current = edits[cellKey(row.entityId, cell.field)] ?? cell.value
        if (cell.source.trim() !== '' && current.trim() === '') count += 1
      }
    }
    return count
  }, [entries, edits])

  function handleSave() {
    if (dirtyChanges.length === 0 || isSaving) return
    setIsSaving(true)
    const changes = dirtyChanges
    const promise = saveTranslations(entityType, locale, changes)
    toast.promise(promise, {
      loading: 'Saving translations...',
      success: `${changes.length} translation${changes.length === 1 ? '' : 's'} saved`,
      error: 'Failed to save translations',
    })
    promise
      .then(() => {
        // Fold saved edits into the baseline so the dirty count resets.
        setEntries((previous) =>
          previous.map((row) => ({
            ...row,
            fields: row.fields.map((cell) => {
              const edited = edits[cellKey(row.entityId, cell.field)]
              return edited === undefined ? cell : { ...cell, value: edited }
            }),
          })),
        )
        setEdits({})
      })
      .catch(() => {})
      .finally(() => setIsSaving(false))
  }

  const localeLabel = TARGET_LOCALES.find((option) => option.value === locale)?.label ?? locale

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Languages className="h-6 w-6" />
            Translations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Translate guest-facing content. Empty fields fall back to the English source text.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {missingCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {missingCount} missing
            </Badge>
          )}
          <Button onClick={handleSave} disabled={dirtyChanges.length === 0 || isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save{dirtyChanges.length > 0 ? ` (${dirtyChanges.length})` : ''}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="space-y-1.5">
          <Label>Content type</Label>
          <Select value={entityType} onValueChange={handleEntityTypeChange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Language</Label>
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_LOCALES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className={isLoading ? 'pointer-events-none opacity-50' : undefined}>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No content found for this type.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-56">Item</TableHead>
                  <TableHead className="w-1/3">English source</TableHead>
                  <TableHead>{localeLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((row) =>
                  row.fields.map((cell, index) => {
                    const key = cellKey(row.entityId, cell.field)
                    const current = edits[key] ?? cell.value
                    return (
                      <TableRow key={key}>
                        <TableCell className="align-top">
                          {index === 0 && (
                            <div className="max-w-52 truncate font-medium" title={row.entityLabel}>
                              {row.entityLabel}
                            </div>
                          )}
                          <Badge variant="outline" className="mt-1 rounded-full text-xs font-normal">
                            {fieldLabel(cell.field)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap break-words align-top text-sm text-muted-foreground">
                          {cell.source || <span className="italic">—</span>}
                        </TableCell>
                        <TableCell className="align-top">
                          <Textarea
                            value={current}
                            onChange={(event) =>
                              setEdits((previous) => ({ ...previous, [key]: event.target.value }))
                            }
                            rows={Math.min(6, Math.max(1, Math.ceil(cell.source.length / 60)))}
                            placeholder="Falls back to English"
                            className="min-h-9"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  }),
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
