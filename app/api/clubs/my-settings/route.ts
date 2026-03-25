import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "CLUB_MEMBER") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const clubId = session.user.clubId
  if (!clubId) {
    return NextResponse.json({ error: "No club found" }, { status: 404 })
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { settings: true },
  })

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 })
  }

  return NextResponse.json({
    clubName: club.name,
    discountEnabled: club.settings?.discountEnabled ?? false,
    discountPercentage: club.settings
      ? Number(club.settings.discountPercentage)
      : 0,
    minimumOrderEnabled: club.settings?.minimumOrderEnabled ?? false,
    minimumOrderAmount: club.settings
      ? Number(club.settings.minimumOrderAmount)
      : 0,
    clubAddress: {
      line1: club.addressLine1,
      city: club.city,
      eircode: club.eircode,
      country: club.country,
    },
  })
}
