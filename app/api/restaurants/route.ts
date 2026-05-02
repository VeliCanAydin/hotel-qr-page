import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json(restaurants)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const body = await req.json()
  const restaurant = await prisma.restaurant.create({ data: body })
  return NextResponse.json(restaurant, { status: 201 })
}
