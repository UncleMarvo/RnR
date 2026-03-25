import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId, clubName } = await getClubContext(session)

    const [memberCount, orderCount, revenueResult, pendingRevenue, pendingInviteCount] =
      await Promise.all([
        prisma.clubMember.count({ where: { clubId } }),
        prisma.order.count({ where: { clubId } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            clubId,
            status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
        }),
        prisma.revenueShare.aggregate({
          _sum: { amount: true },
          where: { clubId, status: "PENDING" },
        }),
        prisma.invite.count({ where: { clubId, status: "PENDING" } }),
      ])

    return NextResponse.json({
      clubName,
      memberCount,
      orderCount,
      totalRevenue: revenueResult._sum.total
        ? Number(revenueResult._sum.total)
        : 0,
      pendingRevenue: pendingRevenue._sum.amount
        ? Number(pendingRevenue._sum.amount)
        : 0,
      pendingInviteCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
