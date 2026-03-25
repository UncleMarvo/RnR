import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId } = await getClubContext(session)

    const members = await prisma.clubMember.findMany({
      where: { clubId },
      orderBy: { joinedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    const memberIds = members.map((m) => m.userId)
    const orderStats = await prisma.order.groupBy({
      by: ["userId"],
      where: {
        clubId,
        userId: { in: memberIds },
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      _count: { id: true },
      _sum: { total: true },
    })

    const orderStatsMap = new Map(
      orderStats.map((s) => [
        s.userId,
        { count: s._count.id, total: Number(s._sum.total || 0) },
      ])
    )

    const enrichedMembers = members.map((m) => {
      const stats = orderStatsMap.get(m.userId) || { count: 0, total: 0 }
      return {
        id: m.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        phone: m.user.phone,
        joinedAt: m.joinedAt,
        orderCount: stats.count,
        totalSpent: stats.total,
      }
    })

    return NextResponse.json({ members: enrichedMembers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
