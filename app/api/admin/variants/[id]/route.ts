import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateVariantSchema } from "@/lib/validations/admin"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const variant = await prisma.productVariant.findUnique({
    where: { id },
    include: { product: { select: { name: true } } },
  })

  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 })
  }

  return NextResponse.json({
    variant: { ...variant, price: Number(variant.price) },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateVariantSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  // Check SKU uniqueness if SKU is being updated
  if (parsed.data.sku) {
    const existing = await prisma.productVariant.findFirst({
      where: { sku: parsed.data.sku, id: { not: id } },
    })
    if (existing) {
      return NextResponse.json(
        { error: "A variant with this SKU already exists" },
        { status: 409 }
      )
    }
  }

  // Get current variant for stock movement tracking
  const currentVariant = await prisma.productVariant.findUnique({
    where: { id },
  })

  if (!currentVariant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 })
  }

  const variant = await prisma.$transaction(async (tx) => {
    const updated = await tx.productVariant.update({
      where: { id },
      data: parsed.data,
    })

    // Create stock movement if stockQty changed
    if (
      parsed.data.stockQty !== undefined &&
      parsed.data.stockQty !== currentVariant.stockQty
    ) {
      await tx.stockMovement.create({
        data: {
          variantId: id,
          type: "ADJUSTMENT",
          quantity: parsed.data.stockQty - currentVariant.stockQty,
          qtyBefore: currentVariant.stockQty,
          qtyAfter: parsed.data.stockQty,
          notes: "Admin adjustment",
          createdBy: session.user.id,
        },
      })
    }

    return updated
  })

  return NextResponse.json({
    variant: { ...variant, price: Number(variant.price) },
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  // Check if variant has order items
  const orderItemCount = await prisma.orderItem.count({
    where: { variantId: id },
  })

  if (orderItemCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete variant with existing orders" },
      { status: 409 }
    )
  }

  await prisma.productVariant.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
