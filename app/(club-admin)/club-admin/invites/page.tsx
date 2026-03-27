import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Users } from "lucide-react"
import { InviteLinkCard } from "@/components/admin/club/InviteLinkCard"
import { EmailInviteSection } from "./EmailInviteSection"

export const dynamic = 'force-dynamic'

export default async function ClubAdminInvites() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId, clubName } = clubContext

  // Fetch members who joined via invite
  const recentMembers = await prisma.clubMember.findMany({
    where: { clubId },
    take: 10,
    orderBy: { joinedAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  })

  const totalMembers = await prisma.clubMember.count({ where: { clubId } })

  return (
    <div className="space-y-6">
      {/* Section 1 — Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Invite Your Members</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Share R+R with your club members. They can register, browse products,
          and order — everything gets delivered straight to your club.
        </p>
      </div>

      {/* Section 2 — Your Invite Link (PRIMARY FOCUS) */}
      <InviteLinkCard clubId={clubId} clubName={clubName} />

      {/* Section 3 — Send by Email (SECONDARY) */}
      <EmailInviteSection />

      {/* Section 4 — Who Has Joined */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
          <h2 className="font-semibold text-white">Members who joined via invite</h2>
        </div>

        {recentMembers.length > 0 ? (
          <>
            <ul className="space-y-3 mb-4">
              {recentMembers.map((member) => {
                const joinedDate = new Date(member.joinedAt)
                const now = new Date()
                const diffMs = now.getTime() - joinedDate.getTime()
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                let timeAgo: string
                if (diffDays === 0) timeAgo = "today"
                else if (diffDays === 1) timeAgo = "yesterday"
                else if (diffDays < 7) timeAgo = `${diffDays} days ago`
                else if (diffDays < 30) {
                  const weeks = Math.floor(diffDays / 7)
                  timeAgo = `${weeks} week${weeks !== 1 ? "s" : ""} ago`
                } else {
                  const months = Math.floor(diffDays / 30)
                  timeAgo = `${months} month${months !== 1 ? "s" : ""} ago`
                }

                return (
                  <li key={member.id} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
                    <span className="text-sm text-zinc-300">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                    <span className="text-xs text-zinc-500">
                      — joined {timeAgo}
                    </span>
                  </li>
                )
              })}
            </ul>
            {totalMembers > 10 && (
              <Link
                href="/club-admin/members"
                className="inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                View All Members →
              </Link>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-400">
            Nobody has signed up yet. Share your invite link above to get started!
          </p>
        )}
      </div>
    </div>
  )
}
