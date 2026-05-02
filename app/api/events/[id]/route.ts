import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const { id } = await params
  const body = await req.json()
  const event = await prisma.hotelEvent.update({ where: { id }, data: body })
  return NextResponse.json(event)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const { id } = await params
  await prisma.hotelEvent.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
