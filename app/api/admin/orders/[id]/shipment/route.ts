import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { carrier, trackingNumber, trackingUrl, status } = body

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shipment: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (carrier !== undefined) data.carrier = carrier
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber
    if (trackingUrl !== undefined) data.trackingUrl = trackingUrl
    if (status !== undefined) {
      data.status = status
      if (status === "SHIPPED" && !order.shipment?.shippedAt) {
        data.shippedAt = new Date()
      }
      if (status === "DELIVERED" && !order.shipment?.deliveredAt) {
        data.deliveredAt = new Date()
      }
    }

    let shipment
    if (order.shipment) {
      shipment = await prisma.shipment.update({
        where: { orderId: id },
        data,
      })
    } else {
      shipment = await prisma.shipment.create({
        data: {
          orderId: id,
          ...data,
        },
      })
    }

    // Sync order status with shipment status
    if (status === "SHIPPED" && order.status === "PROCESSING") {
      await prisma.order.update({
        where: { id },
        data: { status: "SHIPPED" },
      })
    }
    if (status === "DELIVERED" && ["PROCESSING", "SHIPPED"].includes(order.status)) {
      await prisma.order.update({
        where: { id },
        data: { status: "DELIVERED" },
      })
    }

    return NextResponse.json({
      shipment: JSON.parse(JSON.stringify(shipment)),
    })
  } catch (error) {
    console.error("Shipment update error:", error)
    return NextResponse.json(
      { error: "Failed to update shipment" },
      { status: 500 }
    )
  }
}
