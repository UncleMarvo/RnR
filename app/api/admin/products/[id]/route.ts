import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProductSchema } from "@/lib/validations/admin"
import { deleteFromR2 } from "@/lib/r2"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const serialized = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  }

  return NextResponse.json({ product: serialized })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const { oldImageKey, ...data } = parsed.data

  // Check slug uniqueness if slug is being updated
  if (data.slug) {
    const existing = await prisma.product.findFirst({
      where: { slug: data.slug, id: { not: id } },
    })
    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      )
    }
  }

  // Delete old image from R2 if replacing
  if (oldImageKey) {
    try {
      await deleteFromR2(oldImageKey)
    } catch (e) {
      console.error("Failed to delete old image from R2:", e)
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  })

  return NextResponse.json({ product })
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

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: body.isActive },
  })

  return NextResponse.json({ product })
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

  // Check if any variants have order items
  const variantsWithOrders = await prisma.productVariant.findMany({
    where: { productId: id },
    include: { _count: { select: { orderItems: true } } },
  })

  const hasOrders = variantsWithOrders.some((v) => v._count.orderItems > 0)
  if (hasOrders) {
    return NextResponse.json(
      { error: "Cannot delete product with existing orders" },
      { status: 409 }
    )
  }

  const product = await prisma.product.findUnique({ where: { id } })

  // Delete image from R2 if exists
  if (product?.imageKey) {
    try {
      await deleteFromR2(product.imageKey)
    } catch (e) {
      console.error("Failed to delete image from R2:", e)
    }
  }

  // Cascade delete handles variants
  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
