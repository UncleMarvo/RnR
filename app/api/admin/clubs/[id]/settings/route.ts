import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clubSettingsSchema } from "@/lib/validations/admin"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const settings = await prisma.clubSettings.findUnique({
    where: { clubId: id },
  })

  if (!settings) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 })
  }

  return NextResponse.json({
    settings: {
      ...settings,
      discountPercentage: Number(settings.discountPercentage),
      revenueSharePercentage: Number(settings.revenueSharePercentage),
      minimumOrderAmount: Number(settings.minimumOrderAmount),
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = clubSettingsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const settings = await prisma.clubSettings.update({
    where: { clubId: id },
    data: parsed.data,
  })

  return NextResponse.json({
    settings: {
      ...settings,
      discountPercentage: Number(settings.discountPercentage),
      revenueSharePercentage: Number(settings.revenueSharePercentage),
      minimumOrderAmount: Number(settings.minimumOrderAmount),
    },
  })
}
