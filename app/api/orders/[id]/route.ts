import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true, imageUrl: true } } },
          },
        },
      },
      shipment: true,
      club: { select: { name: true } },
      address: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Permission check
  const canView =
    session.user.role === "SUPER_ADMIN" ||
    (session.user.role === "CLUB_ADMIN" &&
      session.user.clubId === order.clubId) ||
    order.userId === session.user.id

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      deliveryType: order.deliveryType,
      subtotal: Number(order.subtotal),
      discountPercentage: Number(order.discountPercentage),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      currency: order.currency,
      createdAt: order.createdAt,
      user: order.user,
      club: order.club,
      address: order.address,
      shipment: order.shipment
        ? {
            status: order.shipment.status,
            carrier: order.shipment.carrier,
            trackingNumber: order.shipment.trackingNumber,
            trackingUrl: order.shipment.trackingUrl,
            shippedAt: order.shipment.shippedAt,
            deliveredAt: order.shipment.deliveredAt,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount),
        lineTotal: Number(item.lineTotal),
        variant: {
          name: item.variant.name,
          sku: item.variant.sku,
          product: {
            name: item.variant.product.name,
            imageUrl: item.variant.product.imageUrl,
          },
        },
      })),
    },
  })
}
