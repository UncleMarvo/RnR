import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const [user, orders, addresses, clubMembership] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.address.findMany({
      where: { userId },
    }),
    prisma.clubMember.findUnique({
      where: { userId },
      include: {
        club: { select: { name: true } },
      },
    }),
  ])

  const data = {
    exportedAt: new Date().toISOString(),
    profile: user,
    orders: JSON.parse(JSON.stringify(orders)),
    addresses,
    clubMembership: clubMembership
      ? { clubName: clubMembership.club.name, joinedAt: clubMembership.joinedAt }
      : null,
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="rnr-data-export.json"',
    },
  })
}
