import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId } = await getClubContext(session)

    // Look for existing open invite (no email, PENDING, not expired)
    let invite = await prisma.invite.findFirst({
      where: {
        clubId,
        sentToEmail: null,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    // If none found, create one with 365-day expiry
    if (!invite) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 365)

      invite = await prisma.invite.create({
        data: {
          clubId,
          sentToEmail: null,
          sentById: session.user.id,
          status: "PENDING",
          expiresAt,
        },
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const registrationUrl = `${appUrl}/invite/${invite.token}`

    return NextResponse.json({
      token: invite.token,
      registrationUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
