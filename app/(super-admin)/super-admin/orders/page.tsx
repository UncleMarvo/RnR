import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import Link from "next/link"
import { OrdersFilterBar } from "./OrdersFilterBar"
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
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: now }
    }
    case "year": {
      const from = new Date(now.getFullYear(), 0, 1)
      return { from, to: now }
    }
    default:
      return { from: new Date(0), to: now }
  }
}

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const status = params.status || ""
  const delivery = params.delivery || ""
  const search = params.search || ""
  const range = params.range || ""
  const page = parseInt(params.page || "1", 10)

  const where: Record<string, unknown> = {}

  if (status) {
    where.status = status
  }
  if (delivery) {
    where.deliveryType = delivery
  }
  if (range) {
    const { from, to } = getDateRange(range)
    where.createdAt = { gte: from, lte: to }
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { firstName: { contains: search, mode: "insensitive" } } },
      { user: { lastName: { contains: search, mode: "insensitive" } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true } },
        club: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const serializedOrders = JSON.parse(JSON.stringify(orders))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description={`${total} order${total !== 1 ? "s" : ""} total`}
      />

      <Suspense fallback={null}>
        <OrdersFilterBar />
      </Suspense>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Club</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Delivery</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {serializedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                serializedOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link
                        href={`/super-admin/orders/${order.id}`}
                        className="text-white hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order.user.firstName} {order.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order.club?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.deliveryType} />
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order._count.items}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {formatPrice(order.total)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/super-admin/orders?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/super-admin/orders?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
