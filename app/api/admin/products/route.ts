import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createProductSchema } from "@/lib/validations/admin"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  const serialized = products.map((product) => ({
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  }))

  return NextResponse.json({ products: serialized })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const { slug } = parsed.data

  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
      { status: 409 }
    )
  }

  const product = await prisma.product.create({
    data: parsed.data,
  })

  return NextResponse.json({ product }, { status: 201 })
}
