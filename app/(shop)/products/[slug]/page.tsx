import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductDetail } from "@/components/shop/ProductDetail"
import type { ProductWithVariants } from "@/types"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!product) notFound()

  const serialised: ProductWithVariants = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    variants: product.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      name: v.name,
      sku: v.sku,
      flavour: v.flavour,
      size: v.size,
      price: Number(v.price),
      stockQty: v.stockQty,
      lowStockThreshold: v.lowStockThreshold,
      isActive: v.isActive,
      sortOrder: v.sortOrder,
    })),
  }

  return <ProductDetail product={serialised} />
}
