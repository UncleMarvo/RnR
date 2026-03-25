import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const sku = searchParams.get("sku")
  const excludeId = searchParams.get("excludeId")

  if (!sku) {
    return NextResponse.json({ error: "sku parameter is required" }, { status: 400 })
  }

  const existing = await prisma.productVariant.findFirst({
    where: {
      sku,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })

  return NextResponse.json({ available: !existing })
}
