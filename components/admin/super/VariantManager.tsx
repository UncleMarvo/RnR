"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VariantRow } from "./VariantRow"
import { AddVariantForm } from "./AddVariantForm"

interface VariantData {
  id: string
  name: string
  sku: string
  flavour: string | null
  size: string | null
  price: number
  stockQty: number
  lowStockThreshold: number
  isActive: boolean
  sortOrder: number
}

interface Props {
  productId: string
  variants: VariantData[]
}

export function VariantManager({ productId, variants }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)

  function handleRefresh() {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Variants</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 && !showAddForm && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-8 text-center text-sm text-zinc-500">
          No variants yet. Add a variant to start selling this product.
        </div>
      )}

      <div className="space-y-2">
        {variants.map((variant) => (
          <VariantRow
            key={variant.id}
            variant={variant}
            onUpdate={handleRefresh}
            onDelete={handleRefresh}
          />
        ))}
      </div>

      {showAddForm && (
        <AddVariantForm
          productId={productId}
          onSuccess={() => {
            setShowAddForm(false)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}
