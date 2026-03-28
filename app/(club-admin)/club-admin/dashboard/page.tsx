import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Package, ShoppingBag, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ClubAdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let clubContext
  try {
    clubContext = await getClubContext(session)
  } catch {
    redirect("/super-admin/dashboard")
  }

  const { clubId, clubName } = clubContext
  const firstName = session.user.name?.split(" ")[0] || "there"

  const [
    memberCount,
    orderCount,
    deliveredOrders,
    activeOrders,
    revenueResult,
    clubSettings,
  ] = await Promise.all([
    prisma.clubMember.count({ where: { clubId } }),
    prisma.order.count({ where: { clubId } }),
    prisma.order.count({
      where: { clubId, status: "DELIVERED" },
    }),
    prisma.order.count({
      where: { clubId, status: { in: ["PAID", "PROCESSING"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        clubId,
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.clubSettings.findUnique({ where: { clubId } }),
  ])

  const totalRevenue = revenueResult._sum.total
    ? Number(revenueResult._sum.total)
    : 0

  return (
    <div className="space-y-6">
      {/* Section 1 — Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{clubName}</p>
      </div>

      {/* Section 2 — Action Cards */}
      <div className="space-y-4">
        {/* Card 1 — Invite Members (always shown prominently) */}
        <Link
          href="/club-admin/invites"
          className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-white">Invite Your Members</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Share R+R with your club members so they can start ordering supplements.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-400">
                Invite Members <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2 — Orders Ready for Collection */}
        {deliveredOrders > 0 && (
          <Link
            href="/club-admin/orders?status=DELIVERED"
            className="block rounded-xl border border-amber-800/50 bg-amber-900/20 p-5 transition-colors hover:bg-amber-900/30"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-900/30">
                <Package className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-white">
                  Orders Ready for Collection
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  You have {deliveredOrders} order{deliveredOrders !== 1 ? "s" : ""} that{" "}
                  {deliveredOrders === 1 ? "has" : "have"} been delivered to your club and{" "}
                  {deliveredOrders === 1 ? "is" : "are"} ready to hand out.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-400">
                  View Orders <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Card 3 — Orders Being Prepared */}
        {activeOrders > 0 && (
          <Link
            href="/club-admin/orders"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-900/30">
                <ShoppingBag className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-white">
                  Orders Being Prepared
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {activeOrders} order{activeOrders !== 1 ? "s" : ""}{" "}
                  {activeOrders === 1 ? "is" : "are"} currently being processed and will be
                  delivered to your club soon.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-400">
                  View Orders <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Empty state — no orders at all */}
        {deliveredOrders === 0 && activeOrders === 0 && orderCount === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                <ShoppingBag className="h-6 w-6 text-zinc-500" />
              </div>
              <div>
                <h2 className="font-semibold text-white">No orders yet</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Once your members start ordering, you&apos;ll see their orders here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3 — Members Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
          <h2 className="font-semibold text-white">Your Members</h2>
        </div>

        {memberCount > 0 ? (
          <>
            <p className="text-sm text-zinc-400 mb-4">
              {memberCount} member{memberCount !== 1 ? "s have" : " has"} joined R+R through your club.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/club-admin/invites"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                Invite More Members
              </Link>
              <Link
                href="/club-admin/members"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                View All Members
              </Link>
            </div>
          </>
        ) : (
          <p className="text-zinc-400 text-sm">
            No members have joined yet. Share your invite link from the Invites page to get started.
          </p>
        )}
      </div>

      {/* Section 4 — Quick Stats (understated) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-white">{memberCount}</p>
            <p className="text-xs text-zinc-500">Members registered</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{orderCount}</p>
            <p className="text-xs text-zinc-500">Total orders placed</p>
          </div>
          {clubSettings?.revenueShareEnabled && (
            <div>
              <p className="text-lg font-semibold text-white">
                &euro;{totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500">Club revenue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
