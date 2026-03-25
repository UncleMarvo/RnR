import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { eurosToCents } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const { amount, reason } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { refunds: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order cannot be refunded in its current status" },
        { status: 400 }
      )
    }

    if (!order.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "No payment intent associated with this order" },
        { status: 400 }
      )
    }

    const alreadyRefunded = order.refunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    )
    const maxRefund = Number(order.total) - alreadyRefunded

    if (amount > maxRefund) {
      return NextResponse.json(
        { error: `Maximum refundable amount is €${maxRefund.toFixed(2)}` },
        { status: 400 }
      )
    }

    const stripeRefund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: eurosToCents(amount),
    })

    const refund = await prisma.refund.create({
      data: {
        orderId: id,
        amount,
        reason: reason || null,
        stripeRefundId: stripeRefund.id,
        processedBy: session.user.id,
      },
    })

    const totalRefunded = alreadyRefunded + amount
    if (totalRefunded >= Number(order.total)) {
      await prisma.order.update({
        where: { id },
        data: { status: "REFUNDED" },
      })
    }

    return NextResponse.json({
      refund: JSON.parse(JSON.stringify(refund)),
    })
  } catch (error) {
    console.error("Refund error:", error)
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    )
  }
}
