"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/stores/cartStore"
import { Button } from "@/components/ui/button"
import type { ProductWithVariants, ProductVariant } from "@/types"

interface Props {
  variant: ProductVariant
  product: ProductWithVariants
}

export function AddToCartButton({ variant, product }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const addItem = useCart((s) => s.addItem)

  const isOutOfStock = variant.stockQty === 0

  function handleAdd() {
    setLoading(true)

    for (let i = 0; i < quantity; i++) {
      addItem({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        variantName: variant.name,
        sku: variant.sku,
        price: variant.price,
        stockQty: variant.stockQty,
        imageUrl: product.imageUrl,
      })
    }

    toast.success("Added to cart", {
      description: `${product.name} — ${variant.name}`,
      action: {
        label: "View Cart",
        onClick: () => {
          window.location.href = "/cart"
        },
      },
    })

    setQuantity(1)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-zinc-700">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isOutOfStock || quantity <= 1}
            className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="flex h-10 w-10 items-center justify-center text-sm font-medium text-zinc-100">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity(Math.min(variant.stockQty, quantity + 1))
            }
            disabled={isOutOfStock || quantity >= variant.stockQty}
            className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={isOutOfStock || loading}
        size="lg"
        className="w-full bg-white text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {loading
          ? "Adding..."
          : isOutOfStock
            ? "Out of Stock"
            : "Add to Cart"}
      </Button>
    </div>
  )
}
