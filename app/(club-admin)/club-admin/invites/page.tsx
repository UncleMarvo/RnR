import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatCard } from "@/components/admin/shared/StatCard"
import { Mail, CheckCircle, XCircle } from "lucide-react"
import { InvitesTable } from "./InvitesTable"

export default async function ClubAdminInvites() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId } = clubContext

  const [invites, pendingCount, usedCount, expiredCount] = await Promise.all([
    prisma.invite.findMany({
      where: { clubId },
      orderBy: { createdAt: "desc" },
      include: {
        claimedBy: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.invite.count({ where: { clubId, status: "PENDING" } }),
    prisma.invite.count({ where: { clubId, status: "USED" } }),
    prisma.invite.count({
      where: {
        clubId,
        OR: [
          { status: "EXPIRED" },
          { status: "PENDING", expiresAt: { lt: new Date() } },
        ],
      },
    }),
  ])

  const serializedInvites = JSON.parse(JSON.stringify(invites))

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Invites"
        description="Manage club membership invitations"
        action={
          <Link
            href="/club-admin/invites/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Send Invites
          </Link>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={pendingCount} icon={Mail} />
        <StatCard label="Used" value={usedCount} icon={CheckCircle} />
        <StatCard label="Expired" value={expiredCount} icon={XCircle} />
      </div>

      <InvitesTable invites={serializedInvites} />
    </div>
  )
}
