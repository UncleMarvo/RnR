"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Loader2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useCart } from "@/stores/cartStore"
import { formatPrice } from "@/lib/utils"

interface OrderData {
  orderNumber: string
  total: number
  deliveryType: string
  clubName?: string
  address?: {
    line1: string
    city: string
    eircode: string | null
    country: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    lineTotal: number
    variant: {
      name: string
      product: { name: string }
    }
  }>
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get("payment_intent")
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleared, setCleared] = useState(false)

  // Clear cart once
  useEffect(() => {
    if (!cleared) {
      clearCart()
      setCleared(true)
    }
  }, [clearCart, cleared])

  // Fetch order details
  useEffect(() => {
    if (!paymentIntentId) {
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        const res = await fetch(
          `/api/orders?payment_intent=${paymentIntentId}`
        )
        const data = await res.json()
        if (data.order) setOrder(data.order)
      } catch {
        // Order may not be created yet (webhook delay)
      } finally {
        setLoading(false)
      }
    }

    // Give webhook a moment to process
    const timer = setTimeout(fetchOrder, 2000)
    return () => clearTimeout(timer)
  }, [paymentIntentId])

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 text-2xl font-bold text-zinc-100 sm:text-3xl">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-zinc-400">
          Thank you for your purchase.
        </p>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : order ? (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-zinc-400">Order Number</span>
              <span className="font-mono font-semibold text-zinc-100">
                {order.orderNumber}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Total</span>
              <span className="font-semibold text-zinc-100">
                {formatPrice(order.total)}
              </span>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="text-sm text-zinc-400">
                {order.deliveryType === "CLUB"
                  ? `Your order will be delivered to ${order.clubName ?? "your club"}`
                  : order.address
                    ? `Delivering to ${order.address.line1}, ${order.address.city}`
                    : "Delivering to your saved address"}
              </p>
            </div>

            {order.items.length > 0 && (
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-semibold text-zinc-300">
                  Items Ordered
                </h3>
                <div className="mt-2 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-zinc-400">
                        {item.variant.product.name} — {item.variant.name} x
                        {item.quantity}
                      </span>
                      <span className="text-zinc-300">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-zinc-400">
          Your order is being processed. You can check your order history
          shortly.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className={buttonVariants({ className: "bg-white text-zinc-900 hover:bg-zinc-200" })}
        >
          Continue Shopping
        </Link>
        <Link
          href="/account/orders"
          className={buttonVariants({ variant: "outline", className: "border-zinc-700 hover:bg-zinc-800" })}
        >
          View My Orders
        </Link>
      </div>
    </div>
  )
}
