import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createClubStripeAccount, createClubOnboardingLink } from "@/lib/stripe"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const club = await prisma.club.findUnique({ where: { id } })
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 })
  }

  let stripeAccountId = club.stripeAccountId

  // Create Stripe Connect account if needed
  if (!stripeAccountId) {
    const account = await createClubStripeAccount({
      name: club.name,
      contactEmail: club.contactEmail,
      country: club.country,
    })

    stripeAccountId = account.id

    await prisma.club.update({
      where: { id },
      data: { stripeAccountId },
    })
  }

  // Generate onboarding link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const accountLink = await createClubOnboardingLink(
    stripeAccountId,
    `${baseUrl}/super-admin/clubs/${id}/settings`,
    `${baseUrl}/super-admin/clubs/${id}/settings`
  )

  return NextResponse.json({ onboardingUrl: accountLink.url })
}
