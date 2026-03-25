import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId } = await getClubContext(session)
    const { id } = await props.params

    const invite = await prisma.invite.findUnique({
      where: { id },
    })

    if (!invite || invite.clubId !== clubId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending invites can be revoked" },
        { status: 400 }
      )
    }

    await prisma.invite.update({
      where: { id },
      data: { status: "REVOKED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
