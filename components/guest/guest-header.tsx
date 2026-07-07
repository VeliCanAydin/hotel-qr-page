'use client'

import { Home, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { guestLogout } from '@/lib/actions/guest-auth'
import type { Reservation } from '@/lib/reservations'

export function GuestHeader({ reservation }: { reservation: Reservation }) {
  const router = useRouter()

  const initials = reservation.guestName
    .split(' ')
    .filter((w) => /[A-Za-z]/.test(w[0]))
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          aria-label="Go to home"
        >
          <Home className="h-5 w-5" />
        </Button>

        <span className="text-sm font-semibold">Dosinia Luxury Resort</span>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Guest menu">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{reservation.guestName}</span>
                  <span className="text-xs text-muted-foreground">Room {reservation.roomNumber}</span>
                  <span className="text-xs text-muted-foreground font-mono">{reservation.reservationCode}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-destructive focus:text-destructive cursor-pointer p-0">
                <form action={guestLogout}>
                  <button type="submit" className="flex w-full items-center gap-2 px-2 py-1.5 text-sm">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
