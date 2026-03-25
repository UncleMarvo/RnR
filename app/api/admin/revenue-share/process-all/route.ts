import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { transferRevenueShare } from "@/lib/stripe"
import { eurosToCents } from "@/lib/utils"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const pendingShares = await prisma.revenueShare.findMany({
      where: {
        status: "PENDING",
        club: {
          stripeOnboarded: true,
          stripeAccountId: { not: null },
        },
      },
      include: {
        club: { select: { stripeAccountId: true, name: true } },
        order: { select: { id: true } },
      },
    })

    let processed = 0
    let failed = 0
    const errors: string[] = []

    for (const share of pendingShares) {
      try {
        const transfer = await transferRevenueShare(
          eurosToCents(Number(share.amount)),
          share.club.stripeAccountId!,
          share.order.id
        )

        await prisma.revenueShare.update({
          where: { id: share.id },
          data: {
            status: "TRANSFERRED",
            stripeTransferId: transfer.id,
            transferredAt: new Date(),
          },
        })

        processed++
      } catch (error) {
        failed++
        errors.push(
          `Failed transfer for ${share.club.name} (order ${share.orderId}): ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }
    }

    return NextResponse.json({ processed, failed, errors })
  } catch (error) {
    console.error("Process all revenue shares error:", error)
    return NextResponse.json(
      { error: "Failed to process revenue shares" },
      { status: 500 }
    )
  }
}
