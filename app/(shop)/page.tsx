import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/shop/ProductCard"
import { PostRegistrationInstallBanner } from "@/components/pwa/PostRegistrationInstallBanner"
import type { ProductWithVariants } from "@/types"

export const dynamic = 'force-dynamic'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  const serialised: ProductWithVariants[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl: p.imageUrl,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    variants: p.variants.map((v) => ({
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
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {params?.welcome === '1' && <PostRegistrationInstallBanner />}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Our Products
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Premium supplements for serious athletes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {serialised.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {serialised.length === 0 && (
        <p className="text-center text-zinc-500">
          No products available at the moment.
        </p>
      )}
    </div>
  )
}
