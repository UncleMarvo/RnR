import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Shield, Users, ShoppingBag, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatCard } from "@/components/admin/shared/StatCard"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboard() {
  const [clubCount, memberCount, orderCount, revenueResult, recentOrders, allVariants, clubOverview] =
    await Promise.all([
      prisma.club.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CLUB_MEMBER" } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
          club: { select: { name: true } },
        },
      }),
      prisma.productVariant.findMany({
        where: { isActive: true },
        include: { product: { select: { name: true } } },
      }),
      prisma.club.findMany({
        include: {
          _count: { select: { members: true, orders: true } },
          settings: { select: { revenueShareEnabled: true } },
        },
      }),
    ])

  const totalRevenue = revenueResult._sum.total ? Number(revenueResult._sum.total) : 0
  const lowStock = allVariants.filter((v) => v.stockQty <= v.lowStockThreshold)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Platform overview and key metrics"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Clubs" value={clubCount} icon={Shield} />
        <StatCard label="Total Members" value={memberCount} icon={Users} />
        <StatCard label="Total Orders" value={orderCount} icon={ShoppingBag} />
        <StatCard
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Club
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order.user.firstName} {order.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order.club?.name || "—"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Low Stock Alert</h2>
          </div>
        </div>
        {lowStock.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-green-400">
            All stock levels healthy ✓
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Variant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((v) => (
                  <tr key={v.id} className="border-b border-zinc-800 last:border-b-0">
                    <td className="px-4 py-3 text-sm text-zinc-300">{v.product.name}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{v.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-400">{v.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-400">{v.stockQty}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{v.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lowStock.length > 0 && (
          <div className="border-t border-zinc-800 px-6 py-3">
            <Link
              href="/super-admin/stock"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View all stock →
            </Link>
          </div>
        )}
      </div>

      {/* Club Overview */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Club Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Club Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Members</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Revenue Share</th>
              </tr>
            </thead>
            <tbody>
              {clubOverview.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No clubs yet
                  </td>
                </tr>
              ) : (
                clubOverview.map((club) => (
                  <tr
                    key={club.id}
                    className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      <Link
                        href={`/super-admin/clubs/${club.id}`}
                        className="hover:underline"
                      >
                        {club.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {club._count.members}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {club._count.orders}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={club.settings?.revenueShareEnabled ? "ON" : "OFF"}
                      />
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
