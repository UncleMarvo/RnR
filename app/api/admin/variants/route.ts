import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVariantSchema } from "@/lib/validations/admin"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createVariantSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const { sku, productId } = parsed.data

  // Check SKU uniqueness
  const existing = await prisma.productVariant.findUnique({ where: { sku } })
  if (existing) {
    return NextResponse.json(
      { error: "A variant with this SKU already exists" },
      { status: 409 }
    )
  }

  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    )
  }

  const variant = await prisma.$transaction(async (tx) => {
    const newVariant = await tx.productVariant.create({
      data: parsed.data,
    })

    // Create initial stock movement
    if (parsed.data.stockQty > 0) {
      await tx.stockMovement.create({
        data: {
          variantId: newVariant.id,
          type: "PURCHASE",
          quantity: parsed.data.stockQty,
          qtyBefore: 0,
          qtyAfter: parsed.data.stockQty,
          reference: "Initial stock",
          createdBy: session.user.id,
        },
      })
    }

    return newVariant
  })

  return NextResponse.json({
    variant: { ...variant, price: Number(variant.price) },
  }, { status: 201 })
}
