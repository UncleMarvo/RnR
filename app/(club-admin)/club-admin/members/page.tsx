import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { MembersTable } from "./MembersTable"

export default async function ClubAdminMembers() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId } = clubContext

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

  // Get order stats for each member
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

  const serializedMembers = members.map((m) => {
    const stats = orderStatsMap.get(m.userId) || { count: 0, total: 0 }
    return {
      id: m.id,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      email: m.user.email,
      phone: m.user.phone,
      joinedAt: m.joinedAt.toISOString(),
      orderCount: stats.count,
      totalSpent: stats.total,
    }
  })

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Members"
        description={`${serializedMembers.length} member${serializedMembers.length !== 1 ? "s" : ""} in ${clubContext.clubName}`}
      />
      <MembersTable members={serializedMembers} />
    </div>
  )
}
