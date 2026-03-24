"use client"

import Link from "next/link"
import Image from "next/image"
import type { ProductWithVariants } from "@/types"
import { formatPrice } from "@/lib/utils"

interface Props {
  product: ProductWithVariants
}

export function ProductCard({ product }: Props) {
  const activeVariants = product.variants.filter((v) => v.isActive)
  const lowestPrice = activeVariants.length
    ? Math.min(...activeVariants.map((v) => v.price))
    : 0

  const allOutOfStock = activeVariants.every((v) => v.stockQty === 0)
  const hasLowStock = activeVariants.some(
    (v) => v.stockQty > 0 && v.stockQty < v.lowStockThreshold
  )

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/50 hover:border-zinc-700"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <span className="text-5xl font-bold text-zinc-600">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        {allOutOfStock && (
          <span className="absolute top-3 left-3 rounded-md bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-zinc-400">
            Out of Stock
          </span>
        )}
        {!allOutOfStock && hasLowStock && (
          <span className="absolute top-3 left-3 rounded-md bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-black">
            Low Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {activeVariants.length > 1 ? "From " : ""}
          {formatPrice(lowestPrice)}
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors group-hover:bg-white group-hover:text-zinc-900">
            View Product
          </span>
        </div>
      </div>
    </Link>
  )
}
