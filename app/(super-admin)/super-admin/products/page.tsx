import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Pencil } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { DataTable } from "@/components/admin/shared/DataTable"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { formatPrice } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  const serialized = products.map((product) => {
    const activeVariants = product.variants.filter((v) => v.isActive)
    const lowestPrice = activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => Number(v.price)))
      : null
    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0)

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      skuCount: product.variants.length,
      priceFrom: lowestPrice,
      totalStock,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
    }
  })

  const columns = [
    {
      key: "image",
      label: "Image",
      className: "w-16",
      render: (item: (typeof serialized)[0]) =>
        item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800 text-xs font-bold text-zinc-500">
            {item.name.charAt(0)}
          </div>
        ),
    },
    {
      key: "name",
      label: "Product Name",
      render: (item: (typeof serialized)[0]) => (
        <Link
          href={`/super-admin/products/${item.id}`}
          className="font-medium text-white hover:underline"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: "skuCount",
      label: "SKUs",
      className: "w-20",
      render: (item: (typeof serialized)[0]) => item.skuCount,
    },
    {
      key: "priceFrom",
      label: "Price From",
      render: (item: (typeof serialized)[0]) =>
        item.priceFrom !== null ? formatPrice(item.priceFrom) : "—",
    },
    {
      key: "totalStock",
      label: "Stock",
      render: (item: (typeof serialized)[0]) => item.totalStock,
    },
    {
      key: "isActive",
      label: "Status",
      render: (item: (typeof serialized)[0]) => (
        <StatusBadge status={item.isActive ? "ACTIVE" : "INACTIVE"} />
      ),
    },
    {
      key: "sortOrder",
      label: "Sort",
      className: "w-16",
      render: (item: (typeof serialized)[0]) => item.sortOrder,
    },
    {
      key: "actions",
      label: "",
      className: "w-16",
      render: (item: (typeof serialized)[0]) => (
        <Link
          href={`/super-admin/products/${item.id}`}
          className="inline-flex items-center text-zinc-400 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Link
            href="/super-admin/products/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={serialized}
        emptyMessage="No products yet. Create your first product to get started."
      />
    </div>
  )
}
