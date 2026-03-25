import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addressSchema } from "@/lib/validations/checkout"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 })
  }

  const body = await request.json()

  // Allow partial updates (e.g. just setting isDefault)
  const parsed = addressSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const data = parsed.data

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.line1 !== undefined && { line1: data.line1 }),
      ...(data.line2 !== undefined && { line2: data.line2 || null }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.county !== undefined && { county: data.county || null }),
      ...(data.eircode !== undefined && { eircode: data.eircode || null }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.label !== undefined && { label: data.label || null }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    },
  })

  return NextResponse.json({ address })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 })
  }

  // Check if address is used in an active order
  const activeOrder = await prisma.order.findFirst({
    where: {
      addressId: id,
      status: { in: ["PENDING", "PAID", "PROCESSING"] },
    },
  })

  if (activeOrder) {
    return NextResponse.json(
      { error: "Address is used in an active order" },
      { status: 409 }
    )
  }

  await prisma.address.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
