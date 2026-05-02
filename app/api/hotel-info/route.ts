import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const info = await prisma.hotelInfo.findUnique({ where: { id: "singleton" } })
  return NextResponse.json(info)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const body = await req.json()
  const info = await prisma.hotelInfo.upsert({
    where: { id: "singleton" },
    update: body,
    create: { id: "singleton", ...body },
  })
  return NextResponse.json(info)
}
