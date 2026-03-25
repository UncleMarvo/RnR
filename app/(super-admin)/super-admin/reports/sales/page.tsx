import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatCard } from "@/components/admin/shared/StatCard"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { DateRangeSelector } from "./DateRangeSelector"
import { ShoppingBag, DollarSign, TrendingUp, Users } from "lucide-react"
import { Suspense } from "react"

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
    case "month": {
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
    }
    case "year": {
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    }
    default:
      return { from: new Date(0), to: now }
  }
}

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function SalesReportPage({ searchParams }: Props) {
  const params = await searchParams
  const range = params.range || "all"
  const { from, to } = getDateRange(range)

  const paidStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const

  const dateFilter = { createdAt: { gte: from, lte: to } }

  const [
    totalOrders,
    revenueResult,
    uniqueCustomers,
    ordersByStatus,
    topProducts,
    ordersByClub,
    dailyOrders,
  ] = await Promise.all([
    prisma.order.count({ where: dateFilter }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { ...dateFilter, status: { in: [...paidStatuses] } },
    }),
    prisma.order.findMany({
      where: dateFilter,
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: dateFilter,
    }),
    prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: { quantity: true, lineTotal: true },
      where: { order: dateFilter },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ["clubId"],
      _count: true,
      _sum: { total: true },
      where: { ...dateFilter, status: { in: [...paidStatuses] } },
    }),
    prisma.order.findMany({
      where: dateFilter,
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const totalRevenue = revenueResult._sum.total ? Number(revenueResult._sum.total) : 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Fetch variant + product names for top products
  const variantIds = topProducts.map((p) => p.variantId)
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true } } },
  })
  const variantMap = new Map(variants.map((v) => [v.id, v]))

  // Fetch club names for orders by club
  const clubIds = ordersByClub.map((c) => c.clubId).filter(Boolean) as string[]
  const clubs = await prisma.club.findMany({
    where: { id: { in: clubIds } },
    select: { id: true, name: true },
  })
  const clubMap = new Map(clubs.map((c) => [c.id, c.name]))

  // Revenue share paid per club
  const revShareByClub = await prisma.revenueShare.groupBy({
    by: ["clubId"],
    _sum: { amount: true },
    where: { status: "TRANSFERRED", createdAt: { gte: from, lte: to } },
  })
  const revShareMap = new Map(revShareByClub.map((r) => [r.clubId, Number(r._sum.amount ?? 0)]))

  // Daily trend - aggregate by date string
  const dailyMap = new Map<string, { orders: number; revenue: number }>()
  for (const o of dailyOrders) {
    const day = o.createdAt.toISOString().slice(0, 10)
    const existing = dailyMap.get(day) || { orders: 0, revenue: 0 }
    existing.orders++
    existing.revenue += Number(o.total)
    dailyMap.set(day, existing)
  }
  const dailyData = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sales Report"
        description="Overview of sales performance"
      />

      <Suspense fallback={null}>
        <DateRangeSelector basePath="/super-admin/reports/sales" />
      </Suspense>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={totalOrders} icon={ShoppingBag} />
        <StatCard label="Revenue" value={formatPrice(totalRevenue)} icon={DollarSign} />
        <StatCard label="Avg Order Value" value={formatPrice(avgOrderValue)} icon={TrendingUp} />
        <StatCard label="Unique Customers" value={uniqueCustomers.length} icon={Users} />
      </div>

      {/* Orders by Status */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Orders by Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Count</th>
              </tr>
            </thead>
            <tbody>
              {ordersByStatus.map((row) => (
                <tr key={row.status} className="border-b border-zinc-800 last:border-b-0">
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">{row._count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Top Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Product / Variant</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Units Sold</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((row) => {
                const variant = variantMap.get(row.variantId)
                return (
                  <tr key={row.variantId} className="border-b border-zinc-800 last:border-b-0">
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {variant ? `${variant.product.name} — ${variant.name}` : row.variantId}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">{row._sum.quantity ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">
                      {formatPrice(Number(row._sum.lineTotal ?? 0))}
                    </td>
                  </tr>
                )
              })}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">No sales data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue by Club */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Revenue by Club</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Club</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Rev Share Paid</th>
              </tr>
            </thead>
            <tbody>
              {ordersByClub.map((row) => (
                <tr key={row.clubId || "public"} className="border-b border-zinc-800 last:border-b-0">
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {row.clubId ? clubMap.get(row.clubId) || "Unknown" : "Public (No Club)"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">{row._count}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">
                    {formatPrice(Number(row._sum.total ?? 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">
                    {row.clubId ? formatPrice(revShareMap.get(row.clubId) ?? 0) : "—"}
                  </td>
                </tr>
              ))}
              {ordersByClub.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">No sales data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Daily Trend</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">No data for this period</td>
                </tr>
              ) : (
                dailyData.map(([date, data]) => (
                  <tr key={date} className="border-b border-zinc-800 last:border-b-0">
                    <td className="px-4 py-3 text-sm text-zinc-300">{new Date(date).toLocaleDateString("en-IE")}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">{data.orders}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">{formatPrice(data.revenue)}</td>
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
