import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  REFUNDED: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const serialised = JSON.parse(JSON.stringify(orders))

  if (serialised.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="mt-1 text-sm text-zinc-400">
            View your order history
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">You haven&apos;t placed any orders yet.</p>
          <Link href="/">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Orders</h1>
        <p className="mt-1 text-sm text-zinc-400">View your order history</p>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-zinc-800 md:block">
        <table className="w-full">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Delivery
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {serialised.map(
              (order: {
                id: string
                orderNumber: string
                createdAt: string
                items: { id: string }[]
                total: number
                status: string
                deliveryType: string
              }) => (
                <tr key={order.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-100">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IE")}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {order.items.length}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-100">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={statusColors[order.status] || ""}
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        order.deliveryType === "CLUB"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      }
                    >
                      {order.deliveryType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm font-medium text-zinc-300 hover:text-white"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {serialised.map(
          (order: {
            id: string
            orderNumber: string
            createdAt: string
            items: { id: string }[]
            total: number
            status: string
            deliveryType: string
          }) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:bg-zinc-800/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-100">
                  {order.orderNumber}
                </span>
                <Badge
                  variant="outline"
                  className={statusColors[order.status] || ""}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-IE")}
                </span>
                <span>
                  {order.items.length} item{order.items.length !== 1 && "s"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-100">
                  {formatPrice(order.total)}
                </span>
                <Badge
                  variant="outline"
                  className={
                    order.deliveryType === "CLUB"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  }
                >
                  {order.deliveryType}
                </Badge>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  )
}
