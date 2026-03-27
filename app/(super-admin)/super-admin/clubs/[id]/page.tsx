import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Settings } from "lucide-react"
import { ImpersonateButton } from "@/components/admin/super/ImpersonateButton"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { ClubDetailTabs } from "./ClubDetailTabs"

export const dynamic = 'force-dynamic'

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      settings: true,
      admins: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      members: {
        take: 10,
        orderBy: { joinedAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { members: true, orders: true } },
    },
  })

  if (!club) notFound()

  // Calculate total revenue for this club
  const revenueResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      clubId: id,
      status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
    },
  })

  const serializedClub = {
    ...club,
    settings: club.settings
      ? {
          ...club.settings,
          discountPercentage: Number(club.settings.discountPercentage),
          revenueSharePercentage: Number(club.settings.revenueSharePercentage),
          minimumOrderAmount: Number(club.settings.minimumOrderAmount),
        }
      : null,
    orders: club.orders.map((order) => ({
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      discountPercentage: Number(order.discountPercentage),
    })),
    memberCount: club._count.members,
    orderCount: club._count.orders,
    totalRevenue: revenueResult._sum.total ? Number(revenueResult._sum.total) : 0,
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={club.name}
        description={`${club.city}${club.county ? `, ${club.county}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/super-admin/clubs/${id}/settings`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <ImpersonateButton
              clubId={club.id}
              clubName={club.name}
            />
          </div>
        }
      />

      <ClubDetailTabs club={serializedClub} />
    </div>
  )
}
