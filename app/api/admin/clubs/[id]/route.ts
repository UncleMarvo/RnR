import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateClubSchema } from "@/lib/validations/admin"

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

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      settings: true,
      admins: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      members: {
        take: 10,
        orderBy: { joinedAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { members: true, orders: true } },
    },
  })

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 })
  }

  // Serialize Decimal fields
  return NextResponse.json({
    club: {
      ...club,
      settings: club.settings
        ? {
            ...club.settings,
            discountPercentage: Number(club.settings.discountPercentage),
            revenueSharePercentage: Number(club.settings.revenueSharePercentage),
            minimumOrderAmount: Number(club.settings.minimumOrderAmount),
          }
        : null,
      orders: club.orders.map((order) => ({
        ...order,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        discountPercentage: Number(order.discountPercentage),
      })),
      memberCount: club._count.members,
      orderCount: club._count.orders,
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateClubSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const club = await prisma.club.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ club })
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

  const club = await prisma.club.update({
    where: { id },
    data: { isActive: body.isActive },
  })

  return NextResponse.json({ club })
}
