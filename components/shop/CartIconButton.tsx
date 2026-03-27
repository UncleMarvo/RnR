"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useHydratedCart } from "@/hooks/useHydratedCart"
import { useEffect, useState } from "react"

export function CartIconButton() {
  const { totalItems } = useHydratedCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800"
      aria-label="Cart"
    >
      <ShoppingCart className="size-5 text-zinc-300" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-zinc-900">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
