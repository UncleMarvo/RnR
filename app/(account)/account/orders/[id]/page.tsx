import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  REFUNDED: "bg-red-500/10 text-red-400 border-red-500/20",
}

const shipmentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  RETURNED: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, imageUrl: true } },
            },
          },
        },
      },
      address: true,
      club: true,
      shipment: true,
    },
  })

  if (!order || order.userId !== session.user.id) notFound()

  const o = JSON.parse(JSON.stringify(order))

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/account/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="size-4" />
          Back to Orders
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-white">{o.orderNumber}</h1>
          <Badge
            variant="outline"
            className={statusColors[o.status] || ""}
          >
            {o.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Placed on {new Date(o.createdAt).toLocaleDateString("en-IE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">Items</h2>
        <div className="divide-y divide-zinc-800">
          {o.items.map(
            (item: {
              id: string
              variant: {
                name: string
                product: { name: string; imageUrl: string | null }
              }
              quantity: number
              unitPrice: number
              lineTotal: number
            }) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-100">
                    {item.variant.product.name}
                  </p>
                  <p className="text-sm text-zinc-400">{item.variant.name}</p>
                  <p className="text-sm text-zinc-500">
                    {formatPrice(item.unitPrice)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-zinc-100">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Order Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>{formatPrice(o.subtotal)}</span>
          </div>
          {Number(o.discountAmount) > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount ({Number(o.discountPercentage)}%)</span>
              <span>-{formatPrice(o.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatPrice(o.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Delivery Information
        </h2>
        {o.deliveryType === "CLUB" && o.club ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-zinc-100">
              Delivering to {o.club.name}
            </p>
            <p className="text-zinc-400">
              {[
                o.club.addressLine1,
                o.club.addressLine2,
                o.club.city,
                o.club.county,
                o.club.eircode,
                o.club.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        ) : o.address ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-zinc-100">
              {o.address.firstName} {o.address.lastName}
            </p>
            <p className="text-zinc-400">
              {[
                o.address.line1,
                o.address.line2,
                o.address.city,
                o.address.county,
                o.address.eircode,
                o.address.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No delivery address on file</p>
        )}
      </div>

      {/* Shipment Info */}
      {o.shipment && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            Shipment
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Status:</span>
              <Badge
                variant="outline"
                className={
                  shipmentStatusColors[o.shipment.status] || ""
                }
              >
                {o.shipment.status}
              </Badge>
            </div>
            {o.shipment.carrier && (
              <p className="text-zinc-400">
                <span className="text-zinc-500">Carrier:</span>{" "}
                {o.shipment.carrier}
              </p>
            )}
            {o.shipment.trackingNumber && (
              <p className="text-zinc-400">
                <span className="text-zinc-500">Tracking:</span>{" "}
                {o.shipment.trackingUrl ? (
                  <a
                    href={o.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {o.shipment.trackingNumber}
                  </a>
                ) : (
                  o.shipment.trackingNumber
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
