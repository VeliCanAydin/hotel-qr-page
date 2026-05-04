import { UtensilsCrossed } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function GuestRoomServicePage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              Your room service orders will appear here once you place them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
