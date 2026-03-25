import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      isActive: true,
      sortOrder: true,
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          productId: true,
          name: true,
          sku: true,
          flavour: true,
          size: true,
          price: true,
          stockQty: true,
          lowStockThreshold: true,
          isActive: true,
          sortOrder: true,
        },
      },
    },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const serialised = JSON.parse(JSON.stringify(product))

  return NextResponse.json({ product: serialised })
}
