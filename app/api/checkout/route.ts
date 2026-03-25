import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { eurosToCents, calculateDiscount } from "@/lib/utils"
import { checkoutSchema } from "@/lib/validations/checkout"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { items } = parsed.data
  const variantIds = items.map((i) => i.variantId)

  // Fetch live prices from DB — never trust client
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: { product: { select: { name: true } } },
  })

  if (variants.length !== items.length) {
    return NextResponse.json(
      { error: "Some items are no longer available" },
      { status: 400 }
    )
  }

  // Check stock
  const outOfStock: string[] = []
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId)
    if (!variant || variant.stockQty < item.quantity) {
      outOfStock.push(
        variant
          ? `${variant.product.name} — ${variant.name} (only ${variant.stockQty} left)`
          : item.variantId
      )
    }
  }

  if (outOfStock.length > 0) {
    return NextResponse.json(
      { error: `Out of stock: ${outOfStock.join(", ")}` },
      { status: 400 }
    )
  }

  // Calculate subtotal from DB prices
  let subtotal = 0
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId)!
    subtotal += Number(variant.price) * item.quantity
  }
  subtotal = Math.round(subtotal * 100) / 100

  // Get discount if CLUB_MEMBER
  let discountPercentage = 0
  let clubId: string | null = null
  const deliveryType =
    session.user.role === "CLUB_MEMBER" ? "CLUB" : "HOME"

  if (
    session.user.role === "CLUB_MEMBER" &&
    session.user.clubId
  ) {
    clubId = session.user.clubId
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId },
    })
    if (clubSettings?.discountEnabled) {
      discountPercentage = Number(clubSettings.discountPercentage)
    }

    // Check club minimum order
    if (
      clubSettings?.minimumOrderEnabled &&
      subtotal < Number(clubSettings.minimumOrderAmount)
    ) {
      return NextResponse.json(
        {
          error: `Minimum order amount is €${Number(clubSettings.minimumOrderAmount).toFixed(2)}`,
        },
        { status: 400 }
      )
    }
  }

  // Check global minimum order
  const globalSettings = await prisma.globalSettings.findFirst()
  if (
    globalSettings?.minimumOrderEnabled &&
    subtotal < Number(globalSettings.minimumOrderAmount)
  ) {
    return NextResponse.json(
      {
        error: `Minimum order amount is €${Number(globalSettings.minimumOrderAmount).toFixed(2)}`,
      },
      { status: 400 }
    )
  }

  const { discountAmount, finalPrice: total } = calculateDiscount(
    subtotal,
    discountPercentage
  )

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: eurosToCents(total),
    currency: "eur",
    metadata: {
      userId: session.user.id,
      clubId: clubId ?? "",
      deliveryType,
      discountPercentage: String(discountPercentage),
      discountAmount: String(discountAmount),
      subtotal: String(subtotal),
      itemsJson: JSON.stringify(
        items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        }))
      ),
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    total,
    subtotal,
    discountAmount,
    discountPercentage,
  })
}
