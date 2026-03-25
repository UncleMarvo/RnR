import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { ClubSettingsView } from "@/components/admin/club/ClubSettingsView"

export default async function ClubAdminSettings() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId } = clubContext

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { settings: true },
  })

  if (!club) {
    redirect("/club-admin/dashboard")
  }

  const serializedSettings = club.settings
    ? {
        discountEnabled: club.settings.discountEnabled,
        discountPercentage: Number(club.settings.discountPercentage),
        revenueShareEnabled: club.settings.revenueShareEnabled,
        revenueSharePercentage: Number(club.settings.revenueSharePercentage),
        minimumOrderEnabled: club.settings.minimumOrderEnabled,
        minimumOrderAmount: Number(club.settings.minimumOrderAmount),
      }
    : null

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description={`Settings for ${clubContext.clubName}`}
      />

      <ClubSettingsView
        club={{
          name: club.name,
          addressLine1: club.addressLine1,
          addressLine2: club.addressLine2,
          city: club.city,
          county: club.county,
          eircode: club.eircode,
          country: club.country,
          contactFirstName: club.contactFirstName,
          contactLastName: club.contactLastName,
          contactEmail: club.contactEmail,
          contactPhone: club.contactPhone,
        }}
        settings={serializedSettings}
        stripeOnboarded={club.stripeOnboarded}
      />
    </div>
  )
}
