import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId } = await req.json()

    if (!clubId) {
      return NextResponse.json({ error: "clubId is required" }, { status: 400 })
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, isActive: true },
    })

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    if (!club.isActive) {
      return NextResponse.json({ error: "Club is not active" }, { status: 400 })
    }

    // Set impersonation cookie
    const cookieStore = await cookies()
    cookieStore.set("rnr-impersonating", JSON.stringify({
      clubId: club.id,
      clubName: club.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 hours
    })

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "IMPERSONATE_START",
        entityType: "Club",
        entityId: clubId,
        metadata: { clubName: club.name },
      },
    })

    return NextResponse.json({ success: true, clubName: club.name })
  } catch (error) {
    console.error("Impersonation error:", error)
    return NextResponse.json(
      { error: "Failed to start impersonation" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const cookieStore = await cookies()
    const impersonating = cookieStore.get("rnr-impersonating")

    if (!impersonating?.value) {
      return NextResponse.json({ impersonating: false })
    }

    const data = JSON.parse(impersonating.value)
    return NextResponse.json({
      impersonating: true,
      clubId: data.clubId,
      clubName: data.clubName,
    })
  } catch {
    return NextResponse.json({ impersonating: false })
  }
}
