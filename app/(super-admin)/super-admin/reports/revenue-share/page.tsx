import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatCard } from "@/components/admin/shared/StatCard"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { DateRangeSelector } from "../sales/DateRangeSelector"
import { ProcessAllButton, ProcessTransferButton } from "./RevenueShareClient"
import { DollarSign, Clock, Shield } from "lucide-react"
import { Suspense } from "react"

export const dynamic = 'force-dynamic'

function getDateRange(range: string): { from: Date; to: Date } {
  const now = new Date()
  switch (range) {
    case "week": {
      const from = new Date(now)
      const day = from.getDay()
      from.setDate(from.getDate() - (day === 0 ? 6 : day - 1))
      from.setHours(0, 0, 0, 0)
      return { from, to: now }
    }
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    default:
      return { from: new Date(0), to: now }
  }
}

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function RevenueShareReportPage({ searchParams }: Props) {
  const params = await searchParams
  const range = params.range || "all"
  const statusFilter = params.status || ""
  const { from, to } = getDateRange(range)

  const where: Record<string, unknown> = {
    createdAt: { gte: from, lte: to },
  }
  if (statusFilter) {
    where.status = statusFilter
  }

  const shares = await prisma.revenueShare.findMany({
    where,
    include: {
      order: { select: { orderNumber: true, total: true, createdAt: true, id: true } },
      club: { select: { name: true, stripeAccountId: true, stripeOnboarded: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = JSON.parse(JSON.stringify(shares))

  const totalPending = shares
    .filter((s) => s.status === "PENDING")
    .reduce((sum, s) => sum + Number(s.amount), 0)
  const totalTransferred = shares
    .filter((s) => s.status === "TRANSFERRED")
    .reduce((sum, s) => sum + Number(s.amount), 0)
  const clubsWithPending = new Set(
    shares.filter((s) => s.status === "PENDING").map((s) => s.clubId)
  ).size

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Revenue Share Report"
        description="Track club revenue share transfers"
        action={<ProcessAllButton />}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Suspense fallback={null}>
          <DateRangeSelector basePath="/super-admin/reports/revenue-share" />
        </Suspense>
        <select
          defaultValue={statusFilter}
          className="h-9 rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="TRANSFERRED">Transferred</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Pending" value={formatPrice(totalPending)} icon={Clock} />
        <StatCard label="Total Transferred" value={formatPrice(totalTransferred)} icon={DollarSign} />
        <StatCard label="Clubs with Pending" value={clubsWithPending} icon={Shield} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Club</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Order Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Share %</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Share Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Transfer ID</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {serialized.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No revenue share records found
                  </td>
                </tr>
              ) : (
                serialized.map((share: any) => (
                  <tr key={share.id} className="border-b border-zinc-800 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {share.order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{share.club.name}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">
                      {formatPrice(share.order.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">
                      {Number(share.percentage)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium text-right">
                      {formatPrice(share.amount)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={share.status} /></td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(share.createdAt).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-500 truncate max-w-[120px]">
                      {share.stripeTransferId || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {share.status === "PENDING" && share.club.stripeAccountId && share.club.stripeOnboarded && (
                        <ProcessTransferButton
                          orderId={share.order.id}
                          clubName={share.club.name}
                          amount={formatPrice(share.amount)}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
