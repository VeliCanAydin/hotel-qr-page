import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const events = await prisma.hotelEvent.findMany({ orderBy: { date: "asc" } })
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const body = await req.json()
  const event = await prisma.hotelEvent.create({ data: body })
  return NextResponse.json(event, { status: 201 })
}
