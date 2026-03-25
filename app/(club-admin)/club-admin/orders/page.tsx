import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { OrdersFilter } from "./OrdersFilter"
import { Prisma } from "@prisma/client"

export default async function ClubAdminOrders(props: {
  searchParams: Promise<{
    status?: string
    search?: string
    from?: string
    to?: string
    page?: string
  }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId } = clubContext
  const searchParams = await props.searchParams
  const page = Math.max(1, parseInt(searchParams.page || "1"))
  const perPage = 20

  // Build where clause
  const where: Prisma.OrderWhereInput = { clubId }

  if (searchParams.status && searchParams.status !== "ALL") {
    where.status = searchParams.status as Prisma.EnumOrderStatusFilter
  }

  if (searchParams.search) {
    const search = searchParams.search
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      {
        user: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ]
  }

  if (searchParams.from || searchParams.to) {
    where.createdAt = {}
    if (searchParams.from) {
      where.createdAt.gte = new Date(searchParams.from)
    }
    if (searchParams.to) {
      where.createdAt.lte = new Date(searchParams.to + "T23:59:59.999Z")
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { firstName: true, lastName: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  const serializedOrders = JSON.parse(JSON.stringify(orders))
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Orders"
        description={`${total} order${total !== 1 ? "s" : ""} for ${clubContext.clubName}`}
      />

      <OrdersFilter />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
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
                  Items
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
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-zinc-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                serializedOrders.map(
                  (order: {
                    id: string
                    orderNumber: string
                    user: { firstName: string; lastName: string }
                    _count: { items: number }
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
                        {order._count.items}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/club-admin/orders?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/club-admin/orders?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
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
