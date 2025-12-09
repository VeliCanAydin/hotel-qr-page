"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Star,
  Sparkle,
  BrushCleaning,
  UsersRound,
  Bed,
  CircleDollarSign,
  UtensilsCrossed,
  Send,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
import { Slider } from "@/components/ui/slider";
import { DateRange } from "react-day-picker";

// Trip type options
const tripTypes = [
  { value: "business", label: "Business" },
  { value: "leisure", label: "Leisure" },
  { value: "family", label: "Family" },
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
];

// Category ratings configuration
const categories = [
  { key: "cleanliness", label: "Cleanliness", icon: BrushCleaning },
  { key: "staff", label: "Staff & Service", icon: UsersRound },
  { key: "comfort", label: "Comfort", icon: Bed },
  { key: "value", label: "Value for Money", icon: CircleDollarSign },
  { key: "food", label: "Food & Beverage", icon: UtensilsCrossed },
];

// Star Rating Component
function StarRating({
  value,
  onChange,
  size = "default",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: "default" | "large";
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const starSize = size === "large" ? "size-10" : "size-7";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "transition-all duration-150 hover:scale-110 active:scale-95",
            starSize
          )}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "w-full h-full transition-colors",
              (hoverValue || value) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// NPS Scale Component
function NPSScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
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

// Category Rating Row
function CategoryRating({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          max={5}
          min={1}
          step={1}
          className="w-full"
        />
      </div>
      <span className="text-sm font-semibold w-6 text-center">{value}</span>
    </div>
  );
}

export default function FeedbackPage() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [overallRating, setOverallRating] = useState(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 3,
    staff: 3,
    comfort: 3,
    value: 3,
    food: 3,
  });
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [tripType, setTripType] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Progressive disclosure - show more options if low rating
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const showImprovementSection = overallRating > 0 && overallRating <= 3;

  const handleCategoryChange = (key: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    const payload = {
      guest: {
        name,
        email,
        roomNumber,
        stayDates: dateRange
          ? {
              from: dateRange.from?.toISOString(),
              to: dateRange.to?.toISOString(),
            }
          : null,
      },
      ratings: {
        overall: overallRating,
        ...categoryRatings,
        nps: npsScore,
      },
      feedback: {
        positive,
        negative,
        tripType,
      },
      consent,
    };

    console.log("Submitting feedback:", payload);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully. We truly appreciate
              you taking the time to share your experience with us.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Submit Another Response
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary/10 via-background to-accent/10 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkle className="size-3 mr-1" />
            Share Your Experience
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            How Was Your Stay?
          </h1>
          <p className="text-muted-foreground text-lg">
            Your feedback helps us improve and serve you better.
          </p>
        </div>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Overall Rating - First and prominent */}
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle>Overall Experience</CardTitle>
            <CardDescription>
              How would you rate your stay with us?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              size="large"
            />
          </CardContent>
        </Card>

        {/* Progressive disclosure: Show details after rating */}
        {overallRating > 0 && (
          <>
            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guest Information</CardTitle>
                <CardDescription>
                  Help us identify your stay (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      type="number"
                      placeholder="304"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dates of Stay</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select dates</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Ratings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Rate Your Experience</CardTitle>
                    <CardDescription>
                      Help us understand what worked and what didn&apos;t
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
                  >
                    {showDetailedFeedback ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {showDetailedFeedback && (
                <CardContent className="pt-0">
                  <div className="divide-y">
                    {categories.map((cat) => (
                      <CategoryRating
                        key={cat.key}
                        icon={cat.icon}
                        label={cat.label}
                        value={categoryRatings[cat.key as keyof typeof categoryRatings]}
                        onChange={(v) => handleCategoryChange(cat.key, v)}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* NPS Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Would You Recommend Us?</CardTitle>
                <CardDescription>
                  How likely are you to recommend Dosinia to a friend or colleague?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NPSScale value={npsScore} onChange={setNpsScore} />
              </CardContent>
            </Card>

            {/* Qualitative Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tell Us More</CardTitle>
                <CardDescription>
                  Your comments help us improve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="positive">
                    What did you like most about your stay?
                  </Label>
                  <Textarea
                    id="positive"
                    placeholder="The view was amazing, the front desk staff was very helpful..."
                    value={positive}
                    onChange={(e) => setPositive(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Show improvement field prominently if low rating */}
                <div
                  className={cn(
                    "space-y-2 transition-all",
                    showImprovementSection && "p-4 -mx-4 bg-destructive/5 rounded-lg border border-destructive/20"
                  )}
                >
                  <Label
                    htmlFor="negative"
                    className={cn(
                      showImprovementSection && "text-destructive font-medium"
                    )}
                  >
                    What could we have done better?
                  </Label>
                  <Textarea
                    id="negative"
                    placeholder="We're sorry to hear that. Please share what went wrong..."
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    rows={showImprovementSection ? 4 : 3}
                  />
                  {showImprovementSection && (
                    <p className="text-xs text-muted-foreground">
                      Your feedback is important to us. If you provide your email,
                      our team will reach out to address your concerns.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trip Type & Consent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">A Few More Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trip Type */}
                <div className="space-y-3">
                  <Label>What was the purpose of your trip?</Label>
                  <div className="flex flex-wrap gap-2">
                    {tripTypes.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={tripType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTripType(type.value)}
                        className="rounded-full"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 size-4 rounded border-input"
                  />
                  <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
                    May we use your feedback as a testimonial on our website?
                    Your name will only be displayed if you provide it.
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || overallRating === 0}
            >
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
          </>
        )}
      </form>
    </div>
  );
}
