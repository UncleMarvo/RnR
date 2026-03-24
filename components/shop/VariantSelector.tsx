"use client"

import type { ProductVariant } from "@/types"
import { cn } from "@/lib/utils"

interface Props {
  variants: ProductVariant[]
  selectedVariantId: string
  onSelect: (variantId: string) => void
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: Props) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const hasFlavours = variants.some((v) => v.flavour)
  const hasSizes = variants.some((v) => v.size)

  if (!hasFlavours && !hasSizes) return null

  const flavours = hasFlavours
    ? Array.from(new Set(variants.map((v) => v.flavour).filter(Boolean)))
    : []
  const sizes = hasSizes
    ? Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
    : []

  function selectByAttribute(attribute: "flavour" | "size", value: string) {
    // Find the variant matching the new attribute + current other attribute
    const otherAttr = attribute === "flavour" ? "size" : "flavour"
    const otherValue = selectedVariant?.[otherAttr]

    // Try to find exact match with both attributes
    let match = variants.find(
      (v) => v[attribute] === value && v[otherAttr] === otherValue
    )

    // Fallback: find any variant with this attribute value that's in stock
    if (!match) {
      match =
        variants.find((v) => v[attribute] === value && v.stockQty > 0) ||
        variants.find((v) => v[attribute] === value)
    }

    if (match) onSelect(match.id)
  }

  function isVariantAvailable(attribute: "flavour" | "size", value: string) {
    return variants.some((v) => v[attribute] === value && v.stockQty > 0)
  }

  return (
    <div className="space-y-4">
      {flavours.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Flavour
          </label>
          <div className="flex flex-wrap gap-2">
            {flavours.map((flavour) => {
              const isSelected = selectedVariant?.flavour === flavour
              const available = isVariantAvailable("flavour", flavour!)

              return (
                <button
                  key={flavour}
                  onClick={() => available && selectByAttribute("flavour", flavour!)}
                  disabled={!available}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-transparent bg-zinc-900 text-white ring-2 ring-white"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:text-white",
                    !available &&
                      "cursor-not-allowed border-zinc-800 bg-zinc-900/30 text-zinc-600 line-through hover:border-zinc-800 hover:text-zinc-600"
                  )}
                >
                  {flavour}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size
              const available = isVariantAvailable("size", size!)

              return (
                <button
                  key={size}
                  onClick={() => available && selectByAttribute("size", size!)}
                  disabled={!available}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-transparent bg-zinc-900 text-white ring-2 ring-white"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:text-white",
                    !available &&
                      "cursor-not-allowed border-zinc-800 bg-zinc-900/30 text-zinc-600 line-through hover:border-zinc-800 hover:text-zinc-600"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
