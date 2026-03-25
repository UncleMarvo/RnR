import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"

export default async function ClubAdminOrderDetail(props: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { id } = await props.params
  const { clubId } = clubContext

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true } } },
          },
        },
      },
      shipment: true,
      address: true,
    },
  })

  if (!order || order.clubId !== clubId) {
    notFound()
  }

  const serializedOrder = JSON.parse(JSON.stringify(order))

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${new Date(order.createdAt).toLocaleDateString("en-IE", { dateStyle: "long" })}`}
        action={
          <Link
            href="/club-admin/orders"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            ← Back to Orders
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Variant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {serializedOrder.items.map(
                    (item: {
                      id: string
                      variant: {
                        product: { name: string }
                        name: string
                      }
                      quantity: number
                      unitPrice: number
                      lineTotal: number
                    }) => (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-800 last:border-b-0"
                      >
                        <td className="px-4 py-3 text-sm text-white">
                          {item.variant.product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">
                          {item.variant.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">
                          {formatPrice(Number(item.unitPrice))}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">
                          {formatPrice(Number(item.lineTotal))}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-zinc-800 px-6 py-4">
              <div className="space-y-2 text-right">
                <div className="flex justify-end gap-8 text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-zinc-300">
                    {formatPrice(Number(serializedOrder.subtotal))}
                  </span>
                </div>
                {Number(serializedOrder.discountAmount) > 0 && (
                  <div className="flex justify-end gap-8 text-sm">
                    <span className="text-zinc-400">
                      Discount ({Number(serializedOrder.discountPercentage)}%)
                    </span>
                    <span className="text-green-400">
                      -{formatPrice(Number(serializedOrder.discountAmount))}
                    </span>
                  </div>
                )}
                <div className="flex justify-end gap-8 text-sm font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    {formatPrice(Number(serializedOrder.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipment */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Shipment</h2>
            {serializedOrder.shipment ? (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <StatusBadge status={serializedOrder.shipment.status} />
                  </dd>
                </div>
                {serializedOrder.shipment.carrier && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Carrier
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-300">
                      {serializedOrder.shipment.carrier}
                    </dd>
                  </div>
                )}
                {serializedOrder.shipment.trackingNumber && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Tracking Number
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-300">
                      {serializedOrder.shipment.trackingUrl ? (
                        <a
                          href={serializedOrder.shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {serializedOrder.shipment.trackingNumber}
                        </a>
                      ) : (
                        serializedOrder.shipment.trackingNumber
                      )}
                    </dd>
                  </div>
                )}
                {serializedOrder.shipment.shippedAt && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Shipped
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-300">
                      {new Date(
                        serializedOrder.shipment.shippedAt
                      ).toLocaleDateString("en-IE")}
                    </dd>
                  </div>
                )}
                {serializedOrder.shipment.deliveredAt && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Delivered
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-300">
                      {new Date(
                        serializedOrder.shipment.deliveredAt
                      ).toLocaleDateString("en-IE")}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-zinc-500">
                No shipment information yet
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Order Status
            </h3>
            <StatusBadge status={serializedOrder.status} />
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Customer</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-zinc-400">Name</dt>
                <dd className="text-sm text-zinc-300">
                  {serializedOrder.user.firstName}{" "}
                  {serializedOrder.user.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Email</dt>
                <dd className="text-sm text-zinc-300">
                  {serializedOrder.user.email}
                </dd>
              </div>
              {serializedOrder.user.phone && (
                <div>
                  <dt className="text-xs text-zinc-400">Phone</dt>
                  <dd className="text-sm text-zinc-300">
                    {serializedOrder.user.phone}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Refund Notice */}
          <div className="rounded-xl border border-amber-800/50 bg-amber-900/20 p-4">
            <p className="text-xs text-amber-300">
              Contact R+R support to request a refund for this order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
