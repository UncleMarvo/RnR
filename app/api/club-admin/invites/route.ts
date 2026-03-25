import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { createInviteSchema } from "@/lib/validations/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId } = await getClubContext(session)

    const invites = await prisma.invite.findMany({
      where: { clubId },
      orderBy: { createdAt: "desc" },
      include: {
        claimedBy: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    return NextResponse.json({
      invites: JSON.parse(JSON.stringify(invites)),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId, clubName } = await getClubContext(session)
    const body = await req.json()
    const parsed = createInviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, expiryDays } = parsed.data

    // If email provided, check not already a member
    if (email) {
      const existingMember = await prisma.clubMember.findFirst({
        where: {
          clubId,
          user: { email: email.toLowerCase() },
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: "This email is already a member of this club" },
          { status: 400 }
        )
      }
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiryDays || 14))

    const invite = await prisma.invite.create({
      data: {
        clubId,
        sentToEmail: email || null,
        sentById: session.user.id,
        status: "PENDING",
        expiresAt,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const registrationLink = `${appUrl}/invite/${invite.token}`

    // Send email if email provided
    if (email) {
      try {
        await resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME || "R+R"} <${process.env.RESEND_FROM_EMAIL || "noreply@rnr.ie"}>`,
          to: email,
          subject: `You've been invited to join ${clubName} on R+R`,
          text: `Hi there,

${clubName} has invited you to join R+R — premium sports supplements delivered to your club.

Click the link below to create your account and start shopping:
${registrationLink}

This invite expires in ${expiryDays || 14} days.

Questions? Reply to this email.

— The R+R Team`,
        })
      } catch (emailError) {
        console.error("Failed to send invite email:", emailError)
        // Don't fail the whole request — invite is still created
      }
    }

    return NextResponse.json({
      invite: JSON.parse(JSON.stringify(invite)),
      registrationLink,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
