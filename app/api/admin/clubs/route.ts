import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createClubSchema } from "@/lib/validations/admin"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const clubs = await prisma.club.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true, orders: true } },
      settings: true,
    },
  })

  return NextResponse.json({
    clubs: clubs.map((club) => ({
      ...club,
      settings: club.settings
        ? {
            ...club.settings,
            discountPercentage: Number(club.settings.discountPercentage),
            revenueSharePercentage: Number(club.settings.revenueSharePercentage),
            minimumOrderAmount: Number(club.settings.minimumOrderAmount),
          }
        : null,
      memberCount: club._count.members,
      orderCount: club._count.orders,
    })),
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createClubSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const { slug } = parsed.data

  // Check slug uniqueness
  const existing = await prisma.club.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(
      { error: "A club with this slug already exists" },
      { status: 409 }
    )
  }

  const club = await prisma.$transaction(async (tx) => {
    const newClub = await tx.club.create({
      data: parsed.data,
    })

    await tx.clubSettings.create({
      data: { clubId: newClub.id },
    })

    return newClub
  })

  return NextResponse.json({ club }, { status: 201 })
}
