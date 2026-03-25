import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { transferRevenueShare, stripe } from "@/lib/stripe"
import { eurosToCents } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

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
    const revenueShare = await prisma.revenueShare.findUnique({
      where: { orderId: id },
      include: {
        club: { select: { stripeAccountId: true, stripeOnboarded: true, name: true } },
      },
    })

    if (!revenueShare) {
      return NextResponse.json({ error: "Revenue share not found" }, { status: 404 })
    }

    if (revenueShare.status !== "PENDING") {
      return NextResponse.json(
        { error: "Revenue share is not in PENDING status" },
        { status: 400 }
      )
    }

    if (!revenueShare.club.stripeAccountId || !revenueShare.club.stripeOnboarded) {
      return NextResponse.json(
        { error: "Club is not onboarded to Stripe" },
        { status: 400 }
      )
    }

    const transfer = await transferRevenueShare(
      eurosToCents(Number(revenueShare.amount)),
      revenueShare.club.stripeAccountId,
      id
    )

    const updated = await prisma.revenueShare.update({
      where: { orderId: id },
      data: {
        status: "TRANSFERRED",
        stripeTransferId: transfer.id,
        transferredAt: new Date(),
      },
    })

    return NextResponse.json({
      revenueShare: JSON.parse(JSON.stringify(updated)),
    })
  } catch (error) {
    console.error("Revenue share transfer error:", error)
    return NextResponse.json(
      { error: "Failed to process transfer" },
      { status: 500 }
    )
  }
}
