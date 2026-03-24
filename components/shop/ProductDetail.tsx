"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { VariantSelector } from "./VariantSelector"
import { AddToCartButton } from "./AddToCartButton"
import { formatPrice } from "@/lib/utils"
import type { ProductWithVariants } from "@/types"

interface Props {
  product: ProductWithVariants
}

export function ProductDetail({ product }: Props) {
  const inStockVariants = product.variants.filter((v) => v.stockQty > 0)
  const defaultVariant = inStockVariants[0] ?? product.variants[0]
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "")

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? defaultVariant

  if (!selectedVariant) return null

  function stockLabel() {
    if (selectedVariant!.stockQty === 0) return { text: "Out of Stock", color: "text-red-400" }
    if (selectedVariant!.stockQty <= 10) return { text: `Only ${selectedVariant!.stockQty} left`, color: "text-amber-400" }
    return { text: "In Stock", color: "text-green-400" }
  }

  const stock = stockLabel()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={800}
              height={800}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-8xl font-bold text-zinc-600">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <span className="text-2xl font-bold text-white">
              {formatPrice(selectedVariant.price)}
            </span>
          </div>

          <div className="mt-2">
            <span className={`text-sm font-medium ${stock.color}`}>
              {stock.text}
            </span>
          </div>

          {product.variants.length > 1 && (
            <div className="mt-6">
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton variant={selectedVariant} product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
