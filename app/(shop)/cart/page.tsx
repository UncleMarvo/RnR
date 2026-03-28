"use client"

import { useEffect, useState } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CartItem } from "@/components/shop/CartItem"
import { useHydratedCart } from "@/hooks/useHydratedCart"
import { formatPrice, calculateDiscount } from "@/lib/utils"

interface ClubSettings {
  clubName: string
  discountEnabled: boolean
  discountPercentage: number
  minimumOrderEnabled: boolean
  minimumOrderAmount: number
}

export default function CartPage() {
  return (
    <SessionProvider>
      <CartContent />
    </SessionProvider>
  )
}

function CartContent() {
  const { data: session } = useSession()
  const { items, updateQuantity, removeItem, subtotal, isHydrated } = useHydratedCart()
  const [clubSettings, setClubSettings] = useState<ClubSettings | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.role === "CLUB_MEMBER") {
      setLoading(true)
      fetch("/api/clubs/my-settings")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setClubSettings(data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [session?.user?.role])

  const discountPercentage =
    clubSettings?.discountEnabled ? clubSettings.discountPercentage : 0
  const { discountAmount, finalPrice } = calculateDiscount(
    subtotal,
    discountPercentage
  )

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          Your Cart
        </h1>
        <div className="mt-8 animate-pulse space-y-4">
          <div className="h-24 rounded-xl bg-zinc-800" />
          <div className="h-24 rounded-xl bg-zinc-800" />
          <div className="h-6 w-1/3 rounded bg-zinc-800" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 w-16 text-zinc-600" />
          <h1 className="mt-6 text-2xl font-bold text-zinc-100">
            Your Cart
          </h1>
          <p className="mt-2 text-zinc-400">Your cart is empty</p>
          <Link
            href="/"
            className={buttonVariants({ className: "mt-6 bg-white text-zinc-900 hover:bg-zinc-200" })}
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
        Your Cart
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItem
              key={item.variantId}
              item={item}
              onUpdate={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-100">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-zinc-100">{formatPrice(subtotal)}</span>
              </div>

              {discountPercentage > 0 && !loading && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">
                    Club Discount ({discountPercentage}%)
                  </span>
                  <span className="text-green-400">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-zinc-800 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-zinc-100">Total</span>
                  <span className="font-semibold text-zinc-100">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {clubSettings?.minimumOrderEnabled &&
              subtotal < clubSettings.minimumOrderAmount && (
                <p className="mt-4 text-sm text-amber-400">
                  Minimum order amount is{" "}
                  {formatPrice(clubSettings.minimumOrderAmount)}
                </p>
              )}

            <Link
              href="/checkout"
              aria-disabled={!isHydrated || items.length === 0}
              className={buttonVariants({ size: "lg", className: `mt-6 w-full bg-white text-zinc-900 hover:bg-zinc-200 ${!isHydrated || items.length === 0 ? "pointer-events-none opacity-50" : ""}` })}
            >
              Proceed to Checkout
            </Link>

            <div className="mt-3 text-center">
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-zinc-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
