import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get("payment_intent")

  // Fetch single order by payment intent (for success page)
  if (paymentIntentId) {
    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        club: { select: { name: true } },
        address: true,
      },
    })

    if (!order) {
      return NextResponse.json({ order: null })
    }

    // Permission check
    if (
      session.user.role !== "SUPER_ADMIN" &&
      order.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        total: Number(order.total),
        deliveryType: order.deliveryType,
        clubName: order.club?.name,
        address: order.address
          ? {
              line1: order.address.line1,
              city: order.address.city,
              eircode: order.address.eircode,
              country: order.address.country,
            }
          : null,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
          variant: {
            name: item.variant.name,
            product: { name: item.variant.product.name },
          },
        })),
      },
    })
  }

  // List orders based on role
  let where = {}
  if (session.user.role === "SUPER_ADMIN") {
    where = {}
  } else if (session.user.role === "CLUB_ADMIN" && session.user.clubId) {
    where = { clubId: session.user.clubId }
  } else {
    where = { userId: session.user.id }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  })

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      itemsCount: order._count.items,
    })),
  })
}
