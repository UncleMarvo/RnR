import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, ShoppingBag, DollarSign, Banknote, Mail } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatCard } from "@/components/admin/shared/StatCard"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"

export default async function ClubAdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId } = clubContext

  const [memberCount, orderCount, revenueResult, pendingRevenue, recentOrders, pendingInviteCount, recentMembers] =
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
      prisma.order.findMany({
        where: { clubId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.invite.count({ where: { clubId, status: "PENDING" } }),
      prisma.clubMember.findMany({
        where: { clubId },
        take: 5,
        orderBy: { joinedAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ])

  const totalRevenue = revenueResult._sum.total
    ? Number(revenueResult._sum.total)
    : 0
  const pendingRevenueAmount = pendingRevenue._sum.amount
    ? Number(pendingRevenue._sum.amount)
    : 0

  const serializedOrders = JSON.parse(JSON.stringify(recentOrders))

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description={`Overview for ${clubContext.clubName}`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={memberCount} icon={Users} />
        <StatCard label="Total Orders" value={orderCount} icon={ShoppingBag} />
        <StatCard
          label="Club Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          label="Pending Revenue Share"
          value={formatPrice(pendingRevenueAmount)}
          icon={Banknote}
        />
      </div>

      {/* Pending Invites Notice */}
      {pendingInviteCount > 0 && (
        <Link
          href="/club-admin/invites"
          className="flex items-center gap-3 rounded-xl border border-amber-800/50 bg-amber-900/20 px-6 py-4 transition-colors hover:bg-amber-900/30"
        >
          <Mail className="h-5 w-5 text-amber-400" />
          <span className="text-sm text-amber-300">
            You have <strong>{pendingInviteCount}</strong> pending invite
            {pendingInviteCount !== 1 ? "s" : ""}
          </span>
        </Link>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link
            href="/club-admin/orders"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {serializedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-zinc-500"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                serializedOrders.map(
                  (order: {
                    id: string
                    orderNumber: string
                    user: { firstName: string; lastName: string }
                    total: number
                    status: string
                    createdAt: string
                  }) => (
                    <tr
                      key={order.id}
                      className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        <Link
                          href={`/club-admin/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {order.user.firstName} {order.user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {formatPrice(Number(order.total))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IE")}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Members */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Members</h2>
          <Link
            href="/club-admin/members"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="px-6 py-4">
          {recentMembers.length === 0 ? (
            <p className="text-sm text-zinc-500">No members yet</p>
          ) : (
            <ul className="space-y-3">
              {recentMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-zinc-300">
                    {member.user.firstName} {member.user.lastName}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString("en-IE")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
