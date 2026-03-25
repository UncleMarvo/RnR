import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const cookieStore = await cookies()
    const impersonating = cookieStore.get("rnr-impersonating")

    let clubId: string | null = null
    if (impersonating?.value) {
      try {
        const data = JSON.parse(impersonating.value)
        clubId = data.clubId
      } catch {
        // Ignore parse errors
      }
    }

    // Clear the impersonation cookie
    cookieStore.set("rnr-impersonating", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    // Write audit log
    if (clubId) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "IMPERSONATE_STOP",
          entityType: "Club",
          entityId: clubId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Stop impersonation error:", error)
    return NextResponse.json(
      { error: "Failed to stop impersonation" },
      { status: 500 }
    )
  }
}
