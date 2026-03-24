import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber } from "@/lib/order-number"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object
    const {
      userId,
      clubId,
      deliveryType,
      discountPercentage,
      discountAmount,
      subtotal,
      itemsJson,
    } = paymentIntent.metadata

    // Idempotency: skip if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    })
    if (existingOrder) {
      return NextResponse.json({ received: true })
    }

    const items: Array<{ variantId: string; quantity: number }> =
      JSON.parse(itemsJson)

    try {
      await prisma.$transaction(async (tx) => {
        const orderNumber = await generateOrderNumber()

        // Fetch variants for prices and names
        const variantIds = items.map((i) => i.variantId)
        const variants = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
          include: { product: { select: { name: true } } },
        })

        const total = Number(subtotal) - Number(discountAmount)

        // Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            clubId: clubId || null,
            status: "PAID",
            deliveryType: deliveryType as "CLUB" | "HOME",
            subtotal: Number(subtotal),
            discountPercentage: Number(discountPercentage),
            discountAmount: Number(discountAmount),
            total,
            currency: "EUR",
            stripePaymentIntentId: paymentIntent.id,
            stripePaymentStatus: "succeeded",
          },
        })

        // Create OrderItems + StockMovements
        for (const item of items) {
          const variant = variants.find((v) => v.id === item.variantId)
          if (!variant) continue

          const unitPrice = Number(variant.price)
          const lineTotal = unitPrice * item.quantity

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice,
              lineTotal,
            },
          })

          // Stock decrement
          const qtyBefore = variant.stockQty
          const qtyAfter = qtyBefore - item.quantity

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: Math.max(0, qtyAfter) },
          })

          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "SALE",
              quantity: -item.quantity,
              qtyBefore,
              qtyAfter: Math.max(0, qtyAfter),
              reference: orderNumber,
              createdBy: userId,
            },
          })
        }

        // Revenue share if applicable
        if (clubId) {
          const clubSettings = await tx.clubSettings.findUnique({
            where: { clubId },
          })
          if (clubSettings?.revenueShareEnabled) {
            const sharePercentage = Number(
              clubSettings.revenueSharePercentage
            )
            const shareAmount =
              Math.round(total * sharePercentage) / 100

            await tx.revenueShare.create({
              data: {
                orderId: order.id,
                clubId,
                orderTotal: total,
                percentage: sharePercentage,
                amount: shareAmount,
                status: "PENDING",
              },
            })
          }
        }

        // Create shipment
        await tx.shipment.create({
          data: {
            orderId: order.id,
            status: "PENDING",
          },
        })
      })
    } catch (err) {
      console.error("Failed to create order from webhook:", err)
      return NextResponse.json(
        { error: "Order creation failed" },
        { status: 500 }
      )
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object
    console.error(
      "Payment failed for PaymentIntent:",
      paymentIntent.id,
      paymentIntent.last_payment_error?.message
    )
  }

  return NextResponse.json({ received: true })
}
