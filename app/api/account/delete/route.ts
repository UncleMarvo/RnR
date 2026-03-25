import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const body = await request.json()
  const { password } = body as { password: string }

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Unable to verify identity" }, { status: 400 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  // Check for active orders
  const activeOrders = await prisma.order.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "PAID", "PROCESSING"] },
    },
  })

  if (activeOrders) {
    return NextResponse.json(
      { error: "Cannot delete account with active orders. Please wait for all orders to be delivered." },
      { status: 409 }
    )
  }

  // Anonymise user and soft-delete
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@deleted.rnr`,
        firstName: "Deleted",
        lastName: "User",
        phone: null,
        passwordHash: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
        isActive: false,
      },
    }),
    prisma.address.deleteMany({ where: { userId } }),
  ])

  return NextResponse.json({ success: true })
}
