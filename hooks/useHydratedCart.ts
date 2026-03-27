"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/stores/cartStore"

export function useHydratedCart() {
  const cart = useCart()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    ...cart,
    items: isHydrated ? cart.items : [],
    totalItems: isHydrated ? cart.totalItems : 0,
    subtotal: isHydrated ? cart.subtotal : 0,
    isHydrated,
  }
}
