import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { ClubsSearch } from "./ClubsSearch"

export const dynamic = 'force-dynamic'

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true } },
      settings: true,
    },
  })

  const serializedClubs = clubs.map((club) => ({
    id: club.id,
    name: club.name,
    city: club.city,
    contactEmail: club.contactEmail,
    isActive: club.isActive,
    memberCount: club._count.members,
    discountPercentage: club.settings
      ? Number(club.settings.discountPercentage)
      : 0,
    discountEnabled: club.settings?.discountEnabled || false,
    revenueShareEnabled: club.settings?.revenueShareEnabled || false,
  }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Clubs"
        description="Manage all registered clubs"
        action={
          <Link
            href="/super-admin/clubs/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            Add Club
          </Link>
        }
      />

      <ClubsSearch clubs={serializedClubs} />
    </div>
  )
}
