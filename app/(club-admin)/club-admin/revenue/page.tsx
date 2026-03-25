import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatCard } from "@/components/admin/shared/StatCard"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { DollarSign, Clock, Calendar } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ClubAdminRevenue() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId } = clubContext

  const [totalEarned, pendingAmount, lastTransfer, revenueShares] =
    await Promise.all([
      prisma.revenueShare.aggregate({
        _sum: { amount: true },
        where: { clubId, status: "TRANSFERRED" },
      }),
      prisma.revenueShare.aggregate({
        _sum: { amount: true },
        where: { clubId, status: "PENDING" },
      }),
      prisma.revenueShare.findFirst({
        where: { clubId, status: "TRANSFERRED" },
        orderBy: { transferredAt: "desc" },
        select: { transferredAt: true },
      }),
      prisma.revenueShare.findMany({
        where: { clubId },
        orderBy: { createdAt: "desc" },
        include: {
          order: { select: { orderNumber: true, total: true } },
        },
      }),
    ])

  const totalEarnedAmount = totalEarned._sum.amount
    ? Number(totalEarned._sum.amount)
    : 0
  const pendingAmountValue = pendingAmount._sum.amount
    ? Number(pendingAmount._sum.amount)
    : 0
  const lastTransferDate = lastTransfer?.transferredAt
    ? new Date(lastTransfer.transferredAt).toLocaleDateString("en-IE")
    : "None"

  const serializedShares = JSON.parse(JSON.stringify(revenueShares))

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Revenue Share"
        description={`Revenue share history for ${clubContext.clubName}`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Earned"
          value={formatPrice(totalEarnedAmount)}
          icon={DollarSign}
        />
        <StatCard
          label="Pending"
          value={formatPrice(pendingAmountValue)}
          icon={Clock}
        />
        <StatCard
          label="Last Transfer"
          value={lastTransferDate}
          icon={Calendar}
        />
      </div>

      {/* Revenue Share Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Order Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Share %
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Share Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Transfer ID
                </th>
              </tr>
            </thead>
            <tbody>
              {serializedShares.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-zinc-500"
                  >
                    No revenue share records yet
                  </td>
                </tr>
              ) : (
                serializedShares.map(
                  (share: {
                    id: string
                    order: { orderNumber: string; total: number }
                    orderTotal: number
                    percentage: number
                    amount: number
                    status: string
                    createdAt: string
                    stripeTransferId: string | null
                  }) => (
                    <tr
                      key={share.id}
                      className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {share.order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {formatPrice(Number(share.orderTotal))}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {Number(share.percentage)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {formatPrice(Number(share.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={share.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {new Date(share.createdAt).toLocaleDateString("en-IE")}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-zinc-500">
                        {share.stripeTransferId
                          ? share.stripeTransferId.slice(0, 16) + "..."
                          : "—"}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">
          Revenue share transfers are processed by R+R admin. Contact us if you
          have questions about a pending transfer.
        </p>
      </div>
    </div>
  )
}
