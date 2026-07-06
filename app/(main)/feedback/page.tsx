"use client";

import { useEffect, useState } from "react";
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
  { value: "food-and-beverage", label: "Food & Beverage" },
  { value: "room-issue", label: "Room Issue" },
  { value: "pool-problem", label: "Pool Problem" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "maintenance", label: "Maintenance" },
  { value: "noise-disturbance", label: "Noise Disturbance" },
  { value: "air-conditioning", label: "Air Conditioning" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "other", label: "Other" },
];

const tripTypes = [
  { value: "business", label: "Business" },
  { value: "leisure", label: "Leisure" },
  { value: "family", label: "Family" },
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
];

const categories = [
  { key: "cleanliness", label: "Cleanliness", icon: BrushCleaning },
  { key: "staff", label: "Staff & Service", icon: UsersRound },
  { key: "comfort", label: "Comfort", icon: Bed },
  { key: "value", label: "Value for Money", icon: CircleDollarSign },
  { key: "food", label: "Food & Beverage", icon: UtensilsCrossed },
];

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

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
  const [hoverValue, setHoverValue] = useState(0);
  const starSize = size === "lg" ? "size-11" : "size-8";

  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label={label ?? "Rating"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} of 5`}
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
        <span>Not likely</span>
        <span>Very likely</span>
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
  return (
    <div className="flex items-center gap-1 pt-2">
      <Button type="button" variant="ghost" size="icon" className="-ml-2" onClick={onBack} aria-label="Go back">
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
          {isSubmitting ? "Sending..." : label}
        </Button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function FeedbackPage() {
  const [mode, setMode] = useState<FeedbackMode | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitTitle, setSubmitTitle] = useState("Thank You!");
  const [submitDescription, setSubmitDescription] = useState("Your feedback has been submitted successfully.");

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
        throw new Error(result?.error ?? "Feedback submission failed");
      }

      setSubmitTitle("Thank You!");
      setSubmitDescription("Your rating has been submitted successfully. We truly appreciate your time.");
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Feedback could not be saved.");
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
      setSubmitError("Please upload an image for your request.");
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("file", supportImageFile);

      const uploadResponse = await fetch("/api/support-upload", { method: "POST", body: uploadData });
      const uploadPayload = (await uploadResponse.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!uploadResponse.ok || !uploadPayload?.url) {
        throw new Error(uploadPayload?.error || "Image upload failed.");
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
        throw new Error(requestPayload?.error || "Request could not be saved.");
      }

      setSubmitTitle("Request Received");
      setSubmitDescription("Your support/complaint request has been sent to the Guest Relations team.");
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Request could not be sent.");
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
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- mode select ---------- */

  if (!mode) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Dosinia · Guest Feedback</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">How was your stay?</h1>
        <p className="mt-2 text-muted-foreground">
          Praise or problem — every message goes straight to our Guest Relations team.
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
              <span className="block font-semibold">Rate your stay</span>
              <span className="block text-sm text-muted-foreground">A quick rating, plus anything you want us to know</span>
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
              <span className="block font-semibold">Report an issue</span>
              <span className="block text-sm text-muted-foreground">Something wrong right now? We&apos;ll get on it</span>
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
        <FlowHeader title="Rate your stay" onBack={goHome} />

        {/* 01 — overall */}
        <section className="flex flex-col items-center gap-3 py-10">
          <Stars value={overallRating} onChange={setOverallRating} size="lg" label="Overall rating" />
          <p className={cn("text-sm transition-colors", overallRating ? "font-medium text-foreground" : "text-muted-foreground")}>
            {overallRating ? RATING_LABELS[overallRating - 1] : "Tap a star to begin"}
          </p>
        </section>

        {overallRating > 0 && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 02 — categories */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="01" title="In detail" hint="Optional — rate what you like" />
              <div className="flex flex-col divide-y">
                {categories.map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <cat.icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{cat.label}</span>
                    </div>
                    <Stars
                      value={categoryRatings[cat.key as keyof typeof categoryRatings]}
                      onChange={(v) => handleCategoryChange(cat.key, v)}
                      allowClear
                      label={cat.label}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 03 — recommend */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="02" title="Would you recommend us?" hint="Optional" />
              <RecommendScale value={npsScore} onChange={setNpsScore} />
            </section>

            {/* 04 — words */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="03" title="In your words" />
              <div className="space-y-2">
                <Label htmlFor="positive" className="text-sm text-muted-foreground">What did you enjoy most?</Label>
                <Textarea
                  id="positive"
                  placeholder="The view, the breakfast, someone on the team..."
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
                  {showImprovementEmphasis ? "We're sorry — what went wrong?" : "What could we do better?"}
                </Label>
                <Textarea
                  id="negative"
                  placeholder={showImprovementEmphasis ? "Please tell us what happened, we read every word." : "Anything we should improve..."}
                  value={negative}
                  onChange={(e) => setNegative(e.target.value)}
                  rows={showImprovementEmphasis ? 4 : 3}
                  className={cn(showImprovementEmphasis && "border-destructive/40 focus-visible:ring-destructive/30")}
                />
                {showImprovementEmphasis && (
                  <p className="text-xs text-muted-foreground">
                    Leave your email below and our team will personally follow up.
                  </p>
                )}
              </div>
            </section>

            {/* 05 — about you */}
            <section className="flex flex-col gap-4">
              <SectionHeader step="04" title="About you" hint="Optional" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Name" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input type="email" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input type="number" placeholder="Room number" aria-label="Room number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
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
                        : <span>Dates of stay</span>}
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
                    key={type.value}
                    selected={tripType === type.value}
                    onClick={() => setTripType(tripType === type.value ? "" : type.value)}
                  >
                    {type.label}
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
                <span>May we use your feedback as a testimonial on our website?</span>
              </label>
            </section>

            <SubmitBar
              isSubmitting={isSubmitting}
              error={submitError}
              label="Send feedback"
              summary={
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="tabular-nums">{overallRating}/5</span>
                  <span className="text-muted-foreground/60">·</span>
                  {RATING_LABELS[overallRating - 1]}
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
      <FlowHeader title="Report an issue" onBack={goHome} />

      <div className="flex flex-col gap-10 pt-6">
        {/* 01 — what */}
        <section className="flex flex-col gap-4">
          <SectionHeader step="01" title="What's the issue?" />

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
              Support request
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
              Complaint
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {supportIssueCategories.map((category) => (
              <Chip
                key={category.value}
                selected={supportIssueCategory === category.value}
                onClick={() => setSupportIssueCategory(category.value)}
                tone={supportCategory === "complaint" ? "destructive" : "default"}
              >
                {category.label}
              </Chip>
            ))}
          </div>
        </section>

        {/* 02 — details */}
        <section className="flex flex-col gap-4">
          <SectionHeader step="02" title="The details" />
          <div className="space-y-2">
            <Label htmlFor="support-subject" className="text-sm text-muted-foreground">Subject</Label>
            <Input
              id="support-subject"
              placeholder="e.g. Air conditioning is not working"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message" className="text-sm text-muted-foreground">Description</Label>
            <Textarea
              id="support-message"
              placeholder="What happened, where, and since when..."
              rows={5}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              minLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-image" className="text-sm text-muted-foreground">
              Photo <span className="text-xs">(required — it helps us fix it faster)</span>
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
                    Change photo
                  </label>
                </div>
              </div>
            ) : (
              <label
                htmlFor="support-image"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">Add a photo</span>
                <span className="text-xs">PNG, JPG or WebP — max 5 MB</span>
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
          <SectionHeader step="03" title="Your room" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support-name" className="text-sm text-muted-foreground">Full name</Label>
              <Input
                id="support-name"
                placeholder="Your full name"
                value={supportName}
                onChange={(e) => setSupportName(e.target.value)}
                readOnly={supportGuestLocked}
                disabled={supportGuestLocked || supportGuestLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-room" className="text-sm text-muted-foreground">Room number</Label>
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
              Filled automatically from your sign-in.
            </p>
          )}
        </section>

        <SubmitBar
          isSubmitting={isSubmitting}
          error={submitError}
          label="Send request"
          summary={
            <span>
              {supportCategory === "complaint" ? "Complaint" : "Support"} ·{" "}
              {supportIssueCategories.find((c) => c.value === supportIssueCategory)?.label}
            </span>
          }
        />
      </div>
    </form>
  );
}
