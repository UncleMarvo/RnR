import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
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

  const serialised = JSON.parse(JSON.stringify(products))

  return NextResponse.json({ products: serialised })
}
