"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/actions/auth"
import { guestLogin } from "@/lib/actions/guest-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2 } from "lucide-react"

function GuestLoginForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(guestLogin, { error: "" })

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guest-room-number">Room Number</Label>
        <Input
          id="guest-room-number"
          name="roomNumber"
          type="text"
          placeholder="e.g., 204"
          autoComplete="off"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guest-surname">Surname</Label>
        <Input
          id="guest-surname"
          name="surname"
          type="text"
          placeholder="Enter your surname"
          autoComplete="family-name"
          required
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In as Guest
      </Button>
    </form>
  )
}

function StaffLoginForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, { error: "" })

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          name="email"
          type="email"
          placeholder="admin@dosinia.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-password">Password</Label>
        <Input
          id="staff-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In as Staff
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Dosinia Luxury Hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="guest">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="guest">Guest</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>
            <TabsContent value="guest">
              <GuestLoginForm />
            </TabsContent>
            <TabsContent value="staff">
              <StaffLoginForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
