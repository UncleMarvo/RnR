import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { ShipmentForm } from "@/components/admin/super/ShipmentForm"
import { RefundDialog } from "@/components/admin/super/RefundDialog"
import { RevenueShareTransfer, CopyButton } from "./OrderDetailClient"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      club: { select: { id: true, name: true, addressLine1: true, city: true, county: true, eircode: true, stripeAccountId: true, stripeOnboarded: true } },
      address: true,
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true } } },
          },
        },
      },
      shipment: true,
      revenueShare: {
        include: { club: { select: { name: true, stripeAccountId: true, stripeOnboarded: true } } },
      },
      refunds: { orderBy: { processedAt: "desc" } },
    },
  })

  if (!order) return notFound()

  const serialized = JSON.parse(JSON.stringify(order))

  const alreadyRefunded = serialized.refunds.reduce(
    (sum: number, r: any) => sum + Number(r.amount),
    0
  )
  const maxRefund = Number(serialized.total) - alreadyRefunded
  const canRefund = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(serialized.status) && maxRefund > 0

  return (
    <div className="space-y-6">
      <Link
        href="/super-admin/orders"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <AdminPageHeader
        title={`Order ${serialized.orderNumber}`}
        description={`Placed on ${new Date(serialized.createdAt).toLocaleDateString("en-IE", { dateStyle: "long" })}`}
        action={<StatusBadge status={serialized.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Variant</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {serialized.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-zinc-800 last:border-b-0">
                      <td className="px-4 py-3 text-sm text-zinc-300">{item.variant.product.name}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{item.variant.name}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm text-white text-right font-medium">{formatPrice(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-zinc-800 px-6 py-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-zinc-300">{formatPrice(serialized.subtotal)}</span>
              </div>
              {Number(serialized.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Discount ({Number(serialized.discountPercentage)}%)</span>
                  <span className="text-green-400">-{formatPrice(serialized.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-1 border-t border-zinc-800">
                <span className="text-white">Total</span>
                <span className="text-white">{formatPrice(serialized.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipment */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Shipment</h2>
            <ShipmentForm
              orderId={serialized.id}
              shipment={serialized.shipment}
            />
          </div>

          {/* Refunds */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Refunds</h2>
              {canRefund && (
                <RefundDialog orderId={serialized.id} maxAmount={maxRefund} />
              )}
            </div>
            {serialized.refunds.length === 0 ? (
              <p className="text-sm text-zinc-500">No refunds issued</p>
            ) : (
              <div className="space-y-3">
                {serialized.refunds.map((refund: any) => (
                  <div key={refund.id} className="flex items-center justify-between rounded-lg bg-zinc-800 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{formatPrice(refund.amount)}</p>
                      {refund.reason && (
                        <p className="text-xs text-zinc-400 mt-0.5">{refund.reason}</p>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {new Date(refund.processedAt).toLocaleDateString("en-IE")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-6">
          {/* Customer card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Customer</h3>
            <p className="text-sm font-medium text-white">
              {serialized.user.firstName} {serialized.user.lastName}
            </p>
            <p className="text-sm text-zinc-400">{serialized.user.email}</p>
            <div className="mt-2">
              <StatusBadge status={serialized.user.role} />
            </div>
          </div>

          {/* Delivery card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Delivery</h3>
            <StatusBadge status={serialized.deliveryType} />
            {serialized.deliveryType === "CLUB" && serialized.club && (
              <div className="mt-3 text-sm text-zinc-300">
                <p className="font-medium text-white">{serialized.club.name}</p>
                <p>{serialized.club.addressLine1}</p>
                <p>{serialized.club.city}{serialized.club.county ? `, ${serialized.club.county}` : ""}</p>
                {serialized.club.eircode && <p>{serialized.club.eircode}</p>}
              </div>
            )}
            {serialized.deliveryType === "HOME" && serialized.address && (
              <div className="mt-3 text-sm text-zinc-300">
                <p className="font-medium text-white">
                  {serialized.address.firstName} {serialized.address.lastName}
                </p>
                <p>{serialized.address.line1}</p>
                {serialized.address.line2 && <p>{serialized.address.line2}</p>}
                <p>{serialized.address.city}{serialized.address.county ? `, ${serialized.address.county}` : ""}</p>
                {serialized.address.eircode && <p>{serialized.address.eircode}</p>}
              </div>
            )}
          </div>

          {/* Payment card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Payment</h3>
            {serialized.stripePaymentIntentId && (
              <div className="flex items-center text-sm text-zinc-300">
                <span className="font-mono text-xs truncate max-w-[180px]">
                  {serialized.stripePaymentIntentId}
                </span>
                <CopyButton text={serialized.stripePaymentIntentId} />
              </div>
            )}
            <p className="text-sm text-zinc-400 mt-1">
              Status: {serialized.stripePaymentStatus || "—"}
            </p>
          </div>

          {/* Revenue Share card */}
          {serialized.revenueShare && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Revenue Share</h3>
              <p className="text-sm text-zinc-300">
                Club: <span className="text-white">{serialized.revenueShare.club.name}</span>
              </p>
              <p className="text-sm text-zinc-300">
                Percentage: {Number(serialized.revenueShare.percentage)}%
              </p>
              <p className="text-sm text-zinc-300">
                Amount: <span className="text-white font-medium">{formatPrice(serialized.revenueShare.amount)}</span>
              </p>
              <div className="mt-2">
                <StatusBadge status={serialized.revenueShare.status} />
              </div>
              {serialized.revenueShare.status === "PENDING" &&
                serialized.revenueShare.club.stripeAccountId &&
                serialized.revenueShare.club.stripeOnboarded && (
                  <RevenueShareTransfer
                    orderId={serialized.id}
                    clubName={serialized.revenueShare.club.name}
                    amount={Number(serialized.revenueShare.amount)}
                  />
                )}
              {serialized.revenueShare.stripeTransferId && (
                <p className="text-xs text-zinc-500 mt-2 font-mono truncate">
                  Transfer: {serialized.revenueShare.stripeTransferId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
