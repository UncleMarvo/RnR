import { auth } from "@/lib/auth"
import { getClubContext } from "@/lib/club-context"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { bulkInviteSchema } from "@/lib/validations/admin"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clubId, clubName } = await getClubContext(session)
    const body = await req.json()
    const parsed = bulkInviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { emails, expiryDays } = parsed.data
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const results: Array<{ email: string; success: boolean; error?: string }> =
      []
    let sent = 0
    let failed = 0

    for (const email of emails) {
      try {
        // Check if already a member
        const existingMember = await prisma.clubMember.findFirst({
          where: {
            clubId,
            user: { email: email.toLowerCase() },
          },
        })

        if (existingMember) {
          results.push({
            email,
            success: false,
            error: "Already a member",
          })
          failed++
          continue
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + (expiryDays || 14))

        const invite = await prisma.invite.create({
          data: {
            clubId,
            sentToEmail: email,
            sentById: session.user.id,
            status: "PENDING",
            expiresAt,
          },
        })

        const registrationLink = `${appUrl}/invite/${invite.token}`

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
          console.error(`Failed to send email to ${email}:`, emailError)
          // Invite still created, just email failed
        }

        results.push({ email, success: true })
        sent++
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error"
        results.push({ email, success: false, error: message })
        failed++
      }
    }

    return NextResponse.json({ sent, failed, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
