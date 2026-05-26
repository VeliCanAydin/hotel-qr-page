"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Bed,
  BrushCleaning,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ImagePlus,
  Send,
  Sparkle,
  Star,
  UtensilsCrossed,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
]

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

function StarRating({ value, onChange, size = "default" }: { value: number; onChange: (value: number) => void; size?: "default" | "large" }) {
  const [hoverValue, setHoverValue] = useState(0);
  const starSize = size === "large" ? "size-10" : "size-7";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn("transition-all duration-150 hover:scale-110 active:scale-95", starSize)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "w-full h-full transition-colors",
              (hoverValue || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function NPSScale({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
      <div className="grid grid-cols-11 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "aspect-square rounded-md text-sm font-medium transition-all duration-150",
              "border hover:scale-105 active:scale-95",
              value === num
                ? num <= 6
                  ? "bg-red-500 text-white border-red-500"
                  : num <= 8
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-green-500 text-white border-green-500"
                : "bg-muted/50 hover:bg-muted border-border"
            )}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs px-1">
        <span className="text-red-500">Detractors</span>
        <span className="text-yellow-600">Passives</span>
        <span className="text-green-500">Promoters</span>
      </div>
    </div>
  );
}

function CategoryRating({ icon: Icon, label, value, onChange }: { icon: React.ElementType; label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex-1">
        <Slider value={[value]} onValueChange={([v]) => onChange(v)} max={5} min={1} step={1} className="w-full" />
      </div>
      <span className="text-sm font-semibold w-6 text-center">{value}</span>
    </div>
  );
}

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
  const [categoryRatings, setCategoryRatings] = useState({ cleanliness: 3, staff: 3, comfort: 3, value: 3, food: 3 });
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [tripType, setTripType] = useState("");
  const [consent, setConsent] = useState(false);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);

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

  const showImprovementSection = overallRating > 0 && overallRating <= 3;

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
      ratings: { overall: overallRating, ...categoryRatings, nps: npsScore },
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

      setSubmitTitle("Talebiniz Alındı");
      setSubmitDescription("Your support/complaint request has been sent to the Guest Relations team.");
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Request could not be sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{submitTitle}</h2>
            <p className="text-muted-foreground mb-6">{submitDescription}</p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                goHome();
              }}
              variant="outline"
            >
              Yeni işlem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <section className="relative bg-linear-to-br from-primary/10 via-background to-accent/10 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkle className="size-3 mr-1" />
            {mode === "support" ? "Guest Relations" : "Guest Experience"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {mode === "support" ? "Support / Complaint Request" : "How Was Your Stay?"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {mode === "support"
              ? "Tell us what happened so our team can help quickly."
              : "Your feedback helps us improve and serve you better."}
          </p>
        </div>
      </section>

      {!mode ? (
        <div className="max-w-3xl mx-auto p-4 grid gap-4 md:grid-cols-2 mt-4">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5 text-yellow-500" />
                Rate Us
              </CardTitle>
              <CardDescription>The same rating form as before. Share your experience in a few quick steps.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setMode("rating")}>Open Rating Form</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Support / Complaint Request
              </CardTitle>
              <CardDescription>Select a category, describe your issue, and upload an image. Your request will go to Guest Relations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="destructive" onClick={() => setMode("support")}>Create Request</Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {mode === "rating" ? (
        <form onSubmit={handleRatingSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
          <Button type="button" variant="ghost" className="-ml-2" onClick={goHome}>
            <ArrowLeft className="size-4 mr-2" />Back
          </Button>

          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle>Overall Experience</CardTitle>
              <CardDescription>How would you rate your stay with us?</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <StarRating value={overallRating} onChange={setOverallRating} size="large" />
            </CardContent>
          </Card>

          {overallRating > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guest Information</CardTitle>
                  <CardDescription>Help us identify your stay (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="room">Room Number</Label>
                      <Input id="room" type="number" placeholder="304" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Dates of Stay</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (dateRange.to ? <>{format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}</> : format(dateRange.from, "LLL dd, y")) : <span>Select dates</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={1} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Rate Your Experience</CardTitle>
                      <CardDescription>Help us understand what worked and what didn&apos;t</CardDescription>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}>
                      {showDetailedFeedback ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showDetailedFeedback && (
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {categories.map((cat) => (
                        <CategoryRating key={cat.key} icon={cat.icon} label={cat.label} value={categoryRatings[cat.key as keyof typeof categoryRatings]} onChange={(v) => handleCategoryChange(cat.key, v)} />
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Would You Recommend Us?</CardTitle>
                  <CardDescription>How likely are you to recommend Dosinia to a friend or colleague?</CardDescription>
                </CardHeader>
                <CardContent>
                  <NPSScale value={npsScore} onChange={setNpsScore} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tell Us More</CardTitle>
                  <CardDescription>Your comments help us improve</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="positive">What did you like most about your stay?</Label>
                    <Textarea id="positive" placeholder="The view was amazing, the front desk staff was very helpful..." value={positive} onChange={(e) => setPositive(e.target.value)} rows={3} />
                  </div>

                  <div className={cn("space-y-2 transition-all", showImprovementSection && "p-4 -mx-4 bg-destructive/5 rounded-lg border border-destructive/20")}>
                    <Label htmlFor="negative" className={cn(showImprovementSection && "text-destructive font-medium")}>
                      What could we have done better?
                    </Label>
                    <Textarea id="negative" placeholder="We're sorry to hear that. Please share what went wrong..." value={negative} onChange={(e) => setNegative(e.target.value)} rows={showImprovementSection ? 4 : 3} />
                    {showImprovementSection && (
                      <p className="text-xs text-muted-foreground">Your feedback is important to us. If you provide your email, our team will reach out.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">A Few More Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>What was the purpose of your trip?</Label>
                    <div className="flex flex-wrap gap-2">
                      {tripTypes.map((type) => (
                        <Button key={type.value} type="button" variant={tripType === type.value ? "default" : "outline"} size="sm" onClick={() => setTripType(type.value)} className="rounded-full">
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 rounded border-input" />
                    <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
                      May we use your feedback as a testimonial on our website?
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || overallRating === 0}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
              {submitError ? <p className="text-sm text-destructive text-center">{submitError}</p> : null}
            </>
          )}
        </form>
      ) : null}

      {mode === "support" ? (
        <form onSubmit={handleSupportSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
          <Button type="button" variant="ghost" className="-ml-2" onClick={goHome}>
            <ArrowLeft className="size-4 mr-2" />Back
          </Button>

          <Card>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground pt-2">
                Your request will be sent to Guest Relations. Please add a detailed description and an image.
              </p>

              <div className="space-y-3">
                <Label>Request Type</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button type="button" variant={supportCategory === "support" ? "default" : "outline"} onClick={() => setSupportCategory("support")}>Support Request</Button>
                  <Button type="button" variant={supportCategory === "complaint" ? "destructive" : "outline"} onClick={() => setSupportCategory("complaint")}>Complaint</Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="support-name">Full Name</Label>
                  <Input
                    id="support-name"
                    placeholder="Your full name"
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    readOnly={supportGuestLocked}
                    disabled={supportGuestLocked || supportGuestLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-room">Room Number</Label>
                <Input
                  id="support-room"
                  placeholder="304"
                  value={supportRoom}
                  onChange={(e) => setSupportRoom(e.target.value)}
                  readOnly={supportGuestLocked}
                  disabled={supportGuestLocked || supportGuestLoading}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="support-issue-category">Issue Category</Label>
                <Select value={supportIssueCategory} onValueChange={setSupportIssueCategory}>
                  <SelectTrigger id="support-issue-category">
                    <SelectValue placeholder="Select an issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportIssueCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" placeholder="e.g. Air conditioning is not working" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} minLength={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Description</Label>
                <Textarea id="support-message" placeholder="Please describe the problem or support request in detail..." rows={5} value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} minLength={10} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-image">Image (required)</Label>
                <Input id="support-image" type="file" accept="image/*" onChange={handleSupportImageChange} required />
                <p className="text-xs text-muted-foreground">PNG/JPG/WebP format, maximum 5 MB.</p>
                {supportImagePreview ? (
                  <div className="rounded-lg border p-2 bg-muted/20">
                    <img src={supportImagePreview} alt="Uploaded image preview" className="w-full max-h-64 object-contain rounded" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <ImagePlus className="size-4" />No image selected yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" />Submit Request
              </>
            )}
          </Button>
          {submitError ? <p className="text-sm text-destructive text-center">{submitError}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
