"use client"
import { useEffect, useState } from "react"
import { useCart } from "@/stores/cartStore"

export function useHydratedCart() {
  const cart = useCart()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const items = isHydrated ? cart.items : []

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return {
    items,
    totalItems,
    subtotal,
    isHydrated,
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
  }
}
