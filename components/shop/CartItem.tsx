"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import type { CartItem as CartItemType } from "@/stores/cartStore"

interface Props {
  item: CartItemType
  onUpdate: (variantId: string, quantity: number) => void
  onRemove: (variantId: string) => void
}

export function CartItem({ item, onUpdate, onRemove }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-100 truncate">{item.productName}</p>
        <p className="text-sm text-zinc-400">{item.variantName}</p>
        <p className="mt-1 text-sm text-zinc-300">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onUpdate(item.variantId, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium text-zinc-100">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onUpdate(item.variantId, item.quantity + 1)}
          disabled={item.quantity >= item.stockQty}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <p className="w-20 text-right font-medium text-zinc-100">
        {formatPrice(item.price * item.quantity)}
      </p>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
        onClick={() => onRemove(item.variantId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
