"use client"

import Link from "next/link"
import { XCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <XCircle className="mx-auto h-16 w-16 text-zinc-500" />
        <h1 className="mt-6 text-2xl font-bold text-zinc-100 sm:text-3xl">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-zinc-400">
          Your order was not placed. Your cart has been saved.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/cart"
          className={buttonVariants({ className: "bg-white text-zinc-900 hover:bg-zinc-200" })}
        >
          Return to Cart
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", className: "border-zinc-700 hover:bg-zinc-800" })}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
