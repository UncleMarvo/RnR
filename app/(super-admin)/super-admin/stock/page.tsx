import { prisma } from "@/lib/prisma"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StockTabs } from "./StockTabs"

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  const [variants, movements] = await Promise.all([
    prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: { select: { name: true, sortOrder: true } } },
      orderBy: [
        { product: { sortOrder: "asc" } },
        { sortOrder: "asc" },
      ],
    }),
    prisma.stockMovement.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        variant: {
          include: { product: { select: { name: true } } },
        },
      },
    }),
  ])

  const serializedVariants = variants.map((v) => ({
    id: v.id,
    productName: v.product.name,
    name: v.name,
    sku: v.sku,
    stockQty: v.stockQty,
    lowStockThreshold: v.lowStockThreshold,
    isActive: v.isActive,
  }))

  const serializedMovements = movements.map((m) => ({
    id: m.id,
    productName: m.variant.product.name,
    variantName: m.variant.name,
    type: m.type,
    quantity: m.quantity,
    qtyBefore: m.qtyBefore,
    qtyAfter: m.qtyAfter,
    reference: m.reference,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Stock Management"
        description="Manage stock levels and view movement history"
      />

      <StockTabs variants={serializedVariants} movements={serializedMovements} />
    </div>
  )
}
