"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Bed,
  BrushCleaning,
  CalendarIcon,
  Check,
  ChevronRight,
  CircleDollarSign,
  ImagePlus,
  Loader2,
  Lock,
  Send,
  Star,
  UtensilsCrossed,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

type FeedbackMode = "rating" | "support";
type SupportCategory = "support" | "complaint";

const supportIssueCategories = [
  "food-and-beverage",
  "room-issue",
  "pool-problem",
  "cleanliness",
  "maintenance",
  "noise-disturbance",
  "air-conditioning",
  "wifi",
  "housekeeping",
  "other",
] as const;

const tripTypes = ["business", "leisure", "family", "solo", "couple"] as const;

const categories = [
  { key: "cleanliness", icon: BrushCleaning },
  { key: "staff", icon: UsersRound },
  { key: "comfort", icon: Bed },
  { key: "value", icon: CircleDollarSign },
  { key: "food", icon: UtensilsCrossed },
] as const;

/* ---------- small building blocks ---------- */

function SectionHeader({ step, title, hint }: { step: string; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{step}</span>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {hint ? <span className="ml-auto text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function Stars({
  value,
  onChange,
  size = "sm",
  allowClear = false,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "lg";
  allowClear?: boolean;
  label?: string;
}) {
  const t = useTranslations("fb");
  const [hoverValue, setHoverValue] = useState(0);
  const starSize = size === "lg" ? "size-11" : "size-8";

  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label={label ?? t("ratingLabel")}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t("starOf5", { star })}
          className={cn("transition-transform duration-100 hover:scale-110 active:scale-95 p-0.5", starSize)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(allowClear && value === star ? 0 : star)}
        >
          <Star
            className={cn(
              "h-full w-full transition-colors",
              (hoverValue || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-border"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function RecommendScale({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  const t = useTranslations("fb");
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-11 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(value === num ? null : num)}
            aria-pressed={value === num}
            className={cn(
              "aspect-square rounded-lg border text-sm font-medium tabular-nums transition-all duration-100 active:scale-95",
              value === num
                ? num <= 6
                  ? "border-transparent bg-destructive text-white"
                  : num <= 8
                    ? "border-transparent bg-amber-500 text-white"
                    : "border-transparent bg-emerald-500 text-white"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground/25 hover:text-foreground"
            )}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t("notLikely")}</span>
        <span>{t("veryLikely")}</span>
      </div>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
  tone = "default",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        selected
          ? tone === "destructive"
            ? "border-transparent bg-destructive text-white"
            : "border-transparent bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function FlowHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const t = useTranslations("fb");
  return (
    <div className="flex items-center gap-1 pt-2">
      <Button type="button" variant="ghost" size="icon" className="-ml-2" onClick={onBack} aria-label={t("goBack")}>
        <ArrowLeft className="size-4" />
      </Button>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </div>
  );
}

function SubmitBar({
  isSubmitting,
  error,
  summary,
  label,
}: {
  isSubmitting: boolean;
  error: string;
  summary?: React.ReactNode;
  label: string;
}) {
  const t = useTranslations("fb");
  return (
    <div className="sticky bottom-0 -mx-4 mt-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      {error ? (
        <p className="pb-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">{summary}</div>
        <Button type="submit" size="lg" className="rounded-full px-6" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          {isSubmitting ? t("sending") : label}
        </Button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function FeedbackPage() {
  const t = useTranslations("fb");
  const [mode, setMode] = useState<FeedbackMode | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitTitle, setSubmitTitle] = useState(t("thankYou"));
  const [submitDescription, setSubmitDescription] = useState(t("feedbackSuccess"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [overallRating, setOverallRating] = useState(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  // 0 = not rated; only explicit choices are submitted (0 maps to null)
  const [categoryRatings, setCategoryRatings] = useState({ cleanliness: 0, staff: 0, comfort: 0, value: 0, food: 0 });
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [tripType, setTripType] = useState("");
  const [consent, setConsent] = useState(false);

  const [supportName, setSupportName] = useState("");
  const [supportRoom, setSupportRoom] = useState("");
  const [supportCategory, setSupportCategory] = useState<SupportCategory>("support");
  const [supportIssueCategory, setSupportIssueCategory] = useState("room-issue");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportImageFile, setSupportImageFile] = useState<File | null>(null);
  const [supportImagePreview, setSupportImagePreview] = useState("");
  const [supportGuestLocked, setSupportGuestLocked] = useState(false);
  const [supportGuestLoading, setSupportGuestLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const showImprovementEmphasis = overallRating > 0 && overallRating <= 3;

  const handleCategoryChange = (key: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let mounted = true;

    async function loadGuestContext() {
      try {
        const response = await fetch('/api/guest-context')
        const payload = (await response.json().catch(() => null)) as
          | { guest?: { guestName: string; roomNumber: string } | null }
          | null

        if (!mounted) return

        const guest = payload?.guest ?? null
        if (guest) {
          setSupportName(guest.guestName)
          setSupportRoom(guest.roomNumber)
          setSupportGuestLocked(true)
        }
      } catch {
        // ignore and keep manual entry
      } finally {
        if (mounted) setSupportGuestLoading(false)
      }
    }

    loadGuestContext()

    return () => {
      mounted = false
    }
  }, [])

  const goHome = () => {
    setMode(null);
    setSubmitError("");
    setIsSubmitting(false);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      guest: {
        name,
        email,
        roomNumber,
        stayDates: dateRange
          ? { from: dateRange.from?.toISOString(), to: dateRange.to?.toISOString() }
          : null,
      },
      ratings: {
        overall: overallRating,
        // 0 means the guest never rated that category — store null, not a fake score
        cleanliness: categoryRatings.cleanliness || null,
        staff: categoryRatings.staff || null,
        comfort: categoryRatings.comfort || null,
        value: categoryRatings.value || null,
        food: categoryRatings.food || null,
        nps: npsScore,
      },
      feedback: { positive, negative, tripType },
      consent,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? t("errFeedbackFailed"));
      }

      setSubmitTitle(t("thankYou"));
      setSubmitDescription(t("ratingSuccess"));
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("errFeedbackSaved"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSupportImageFile(file);

    if (!file) {
      setSupportImagePreview("");
      return;
    }

    const preview = URL.createObjectURL(file);
    setSupportImagePreview(preview);
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    if (!supportImageFile) {
      setSubmitError(t("errImageRequired"));
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("file", supportImageFile);

      const uploadResponse = await fetch("/api/support-upload", { method: "POST", body: uploadData });
      const uploadPayload = (await uploadResponse.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!uploadResponse.ok || !uploadPayload?.url) {
        throw new Error(uploadPayload?.error || t("errImageUpload"));
      }

      const requestResponse = await fetch("/api/support-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: supportName,
          roomNumber: supportRoom,
          requestType: supportCategory,
          issueCategory: supportIssueCategory,
          subject: supportSubject,
          message: supportMessage,
          imageUrl: uploadPayload.url,
        }),
      });

      const requestPayload = (await requestResponse.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!requestResponse.ok || !requestPayload?.ok) {
        throw new Error(requestPayload?.error || t("errRequestSaved"));
      }

      setSubmitTitle(t("requestReceived"));
      setSubmitDescription(t("requestSuccess"));
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("errRequestSent"));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- success ---------- */

  if (isSubmitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
            <Check className="size-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{submitTitle}</h2>
          <p className="mt-2 text-muted-foreground">{submitDescription}</p>
          <Button
            variant="outline"
            className="mt-8 rounded-full"
            onClick={() => {
              setIsSubmitted(false);
              goHome();
            }}
          >
            {t("submitAnother")}
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- mode select ---------- */

  if (!mode) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{t("brandLabel")}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("howWasStay")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("praiseOrProblem")}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setMode("rating")}
            className="group flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-accent/50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/15">
              <Star className="size-5 fill-amber-400 text-amber-400" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{t("rateYourStay")}</span>
              <span className="block text-sm text-muted-foreground">{t("rateYourStayDesc")}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setMode("support")}
            className="group flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-accent/50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{t("reportIssue")}</span>
              <span className="block text-sm text-muted-foreground">{t("reportIssueDesc")}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- rating flow ---------- */

  if (mode === "rating") {
    return (
      <form onSubmit={handleRatingSubmit} className="mx-auto w-full max-w-xl px-4 pb-6">
        <FlowHeader title={t("rateYourStay")} onBack={goHome} />

        {/* 01 — overall */}
        <section className="flex flex-col items-center gap-3 py-10">
          <Stars value={overallRating} onChange={setOverallRating} size="lg" label={t("ratingLabel")} />
          <p className={cn("text-sm transition-colors", overallRating ? "font-medium text-foreground" : "text-muted-foreground")}>
            {overallRating ? t(`ratingLabels.${overallRating}`) : t("tapStar")}
          </p>
        </section>

        {overallRating > 0 && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 02 — categories */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="01" title={t("inDetail")} hint={t("inDetailHint")} />
              <div className="flex flex-col divide-y">
                {categories.map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <cat.icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{t(`ratingCategories.${cat.key}`)}</span>
                    </div>
                    <Stars
                      value={categoryRatings[cat.key as keyof typeof categoryRatings]}
                      onChange={(v) => handleCategoryChange(cat.key, v)}
                      allowClear
                      label={t(`ratingCategories.${cat.key}`)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 03 — recommend */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="02" title={t("recommendUs")} hint={t("optional")} />
              <RecommendScale value={npsScore} onChange={setNpsScore} />
            </section>

            {/* 04 — words */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="03" title={t("inYourWords")} />
              <div className="space-y-2">
                <Label htmlFor="positive" className="text-sm text-muted-foreground">{t("enjoyMost")}</Label>
                <Textarea
                  id="positive"
                  placeholder={t("enjoyPlaceholder")}
                  value={positive}
                  onChange={(e) => setPositive(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="negative"
                  className={cn("text-sm", showImprovementEmphasis ? "font-medium text-destructive" : "text-muted-foreground")}
                >
                  {showImprovementEmphasis ? t("whatWrong") : t("whatBetter")}
                </Label>
                <Textarea
                  id="negative"
                  placeholder={showImprovementEmphasis ? t("whatWrongPlaceholder") : t("whatBetterPlaceholder")}
                  value={negative}
                  onChange={(e) => setNegative(e.target.value)}
                  rows={showImprovementEmphasis ? 4 : 3}
                  className={cn(showImprovementEmphasis && "border-destructive/40 focus-visible:ring-destructive/30")}
                />
                {showImprovementEmphasis && (
                  <p className="text-xs text-muted-foreground">
                    {t("followUp")}
                  </p>
                )}
              </div>
            </section>

            {/* 05 — about you */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="04" title={t("aboutYou")} hint={t("optional")} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder={t("namePlaceholder")} aria-label={t("namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
                <Input type="email" placeholder={t("emailPlaceholder")} aria-label={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input type="number" placeholder={t("roomPlaceholder")} aria-label={t("roomPlaceholder")} value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {dateRange?.from
                        ? dateRange.to
                          ? <>{format(dateRange.from, "LLL dd")} – {format(dateRange.to, "LLL dd, y")}</>
                          : format(dateRange.from, "LLL dd, y")
                        : <span>{t("datesOfStay")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={1} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap gap-2">
                {tripTypes.map((type) => (
                  <Chip
                    key={type}
                    selected={tripType === type}
                    onClick={() => setTripType(tripType === type ? "" : type)}
                  >
                    {t(`tripTypes.${type}`)}
                  </Chip>
                ))}
              </div>

              <label htmlFor="consent" className="flex cursor-pointer items-start gap-3 pt-1 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>{t("testimonial")}</span>
              </label>
            </section>

            <SubmitBar
              isSubmitting={isSubmitting}
              error={submitError}
              label={t("sendFeedback")}
              summary={
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="tabular-nums">{overallRating}/5</span>
                  <span className="text-muted-foreground/60">·</span>
                  {t(`ratingLabels.${overallRating}`)}
                </span>
              }
            />
          </div>
        )}
      </form>
    );
  }

  /* ---------- support flow ---------- */

  return (
    <form onSubmit={handleSupportSubmit} className="mx-auto w-full max-w-xl px-4 pb-6">
      <FlowHeader title={t("reportIssue")} onBack={goHome} />

      <div className="flex flex-col gap-10 pt-6">
        {/* 01 — what */}
        <section className="flex flex-col gap-4">
          <SectionHeader step="01" title={t("whatsIssue")} />

          <div className="grid grid-cols-2 gap-1 rounded-full border p-1">
            <button
              type="button"
              onClick={() => setSupportCategory("support")}
              aria-pressed={supportCategory === "support"}
              className={cn(
                "rounded-full py-2 text-sm font-medium transition-colors",
                supportCategory === "support" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("supportRequest")}
            </button>
            <button
              type="button"
              onClick={() => setSupportCategory("complaint")}
              aria-pressed={supportCategory === "complaint"}
              className={cn(
                "rounded-full py-2 text-sm font-medium transition-colors",
                supportCategory === "complaint" ? "bg-destructive text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("complaint")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {supportIssueCategories.map((category) => (
              <Chip
                key={category}
                selected={supportIssueCategory === category}
                onClick={() => setSupportIssueCategory(category)}
                tone={supportCategory === "complaint" ? "destructive" : "default"}
              >
                {t(`issueCategories.${category}`)}
              </Chip>
            ))}
          </div>
        </section>

        {/* 02 — details */}
        <section className="flex flex-col gap-4">
          <SectionHeader step="02" title={t("theDetails")} />
          <div className="space-y-2">
            <Label htmlFor="support-subject" className="text-sm text-muted-foreground">{t("subject")}</Label>
            <Input
              id="support-subject"
              placeholder={t("subjectPlaceholder")}
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message" className="text-sm text-muted-foreground">{t("description")}</Label>
            <Textarea
              id="support-message"
              placeholder={t("descriptionPlaceholder")}
              rows={5}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              minLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-image" className="text-sm text-muted-foreground">
              {t("photo")} <span className="text-xs">{t("photoRequired")}</span>
            </Label>
            {supportImagePreview ? (
              <div className="overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={supportImagePreview} alt="Uploaded image preview" className="max-h-64 w-full object-contain bg-muted/30" />
                <div className="flex items-center justify-between border-t px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">{supportImageFile?.name}</span>
                  <label
                    htmlFor="support-image"
                    className="cursor-pointer text-xs font-medium underline underline-offset-2 hover:text-primary"
                  >
                    {t("changePhoto")}
                  </label>
                </div>
              </div>
            ) : (
              <label
                htmlFor="support-image"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">{t("addPhoto")}</span>
                <span className="text-xs">{t("photoHint")}</span>
              </label>
            )}
            <input
              id="support-image"
              type="file"
              accept="image/*"
              onChange={handleSupportImageChange}
              className="sr-only"
            />
          </div>
        </section>

        {/* 03 — who */}
        <section className="flex flex-col gap-4">
          <SectionHeader step="03" title={t("yourRoom")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support-name" className="text-sm text-muted-foreground">{t("fullName")}</Label>
              <Input
                id="support-name"
                placeholder={t("fullNamePlaceholder")}
                value={supportName}
                onChange={(e) => setSupportName(e.target.value)}
                readOnly={supportGuestLocked}
                disabled={supportGuestLocked || supportGuestLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-room" className="text-sm text-muted-foreground">{t("roomNumber")}</Label>
              <Input
                id="support-room"
                placeholder="304"
                value={supportRoom}
                onChange={(e) => setSupportRoom(e.target.value)}
                readOnly={supportGuestLocked}
                disabled={supportGuestLocked || supportGuestLoading}
              />
            </div>
          </div>
          {supportGuestLocked && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              {t("filledAuto")}
            </p>
          )}
        </section>

        <SubmitBar
          isSubmitting={isSubmitting}
          error={submitError}
          label={t("sendRequest")}
          summary={
            <span>
              {supportCategory === "complaint" ? t("complaint") : t("support")} ·{" "}
              {t(`issueCategories.${supportIssueCategory}`)}
            </span>
          }
        />
      </div>
    </form>
  );
}
