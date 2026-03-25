import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { ProductForm } from "@/components/admin/super/ProductForm"
import { VariantManager } from "@/components/admin/super/VariantManager"

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!product) {
    notFound()
  }

  // Serialise Decimals
  const serializedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    imageKey: product.imageKey,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
  }

  const serializedVariants = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    flavour: v.flavour,
    size: v.size,
    price: Number(v.price),
    stockQty: v.stockQty,
    lowStockThreshold: v.lowStockThreshold,
    isActive: v.isActive,
    sortOrder: v.sortOrder,
  }))

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Edit: ${product.name}`}
        description="Update product details and manage variants"
      />

      <ProductForm product={serializedProduct} mode="edit" />

      <div className="border-t border-zinc-800 pt-8">
        <VariantManager
          productId={product.id}
          variants={serializedVariants}
        />
      </div>
    </div>
  )
}
