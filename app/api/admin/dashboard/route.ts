import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [
    clubCount,
    memberCount,
    orderCount,
    revenueResult,
    recentOrders,
    lowStockVariants,
    clubOverview,
  ] = await Promise.all([
    prisma.club.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CLUB_MEMBER" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        club: { select: { name: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: {
        isActive: true,
        stockQty: { lte: prisma.productVariant.fields?.lowStockThreshold as never },
      },
      include: {
        product: { select: { name: true } },
      },
    }),
    prisma.club.findMany({
      include: {
        _count: { select: { members: true, orders: true } },
        settings: {
          select: { revenueShareEnabled: true },
        },
      },
    }),
  ])

  // Manual low stock filter since Prisma can't compare two columns directly
  const allVariants = await prisma.productVariant.findMany({
    where: { isActive: true },
    include: { product: { select: { name: true } } },
  })
  const lowStock = allVariants.filter((v) => v.stockQty <= v.lowStockThreshold)

  return NextResponse.json({
    clubCount,
    memberCount,
    orderCount,
    totalRevenue: revenueResult._sum.total ? Number(revenueResult._sum.total) : 0,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      customer: `${order.user.firstName} ${order.user.lastName}`,
      club: order.club?.name || null,
    })),
    lowStockVariants: lowStock.map((v) => ({
      id: v.id,
      productName: v.product.name,
      variantName: v.name,
      sku: v.sku,
      stockQty: v.stockQty,
      lowStockThreshold: v.lowStockThreshold,
    })),
    clubOverview: clubOverview.map((club) => ({
      id: club.id,
      name: club.name,
      members: club._count.members,
      orders: club._count.orders,
      revenueShareEnabled: club.settings?.revenueShareEnabled || false,
    })),
  })
}
