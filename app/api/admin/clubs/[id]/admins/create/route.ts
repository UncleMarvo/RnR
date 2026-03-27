import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { generateTempPassword } from "@/lib/temp-password"
import { createClubAdminSchema } from "@/lib/validations/admin"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: clubId } = await params
  const body = await request.json()

  const parsed = createClubAdminSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input"
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { firstName, lastName, email } = parsed.data

  // Check club exists
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  })
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 })
  }

  // Check email not already in use
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    )
  }

  // Generate temp password and hash it
  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  // Create user + club admin in transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role: "CLUB_ADMIN",
        mustChangePassword: true,
        emailVerified: new Date(),
      },
    })

    await tx.clubAdmin.create({
      data: {
        userId: user.id,
        clubId,
      },
    })

    return user
  })

  // Send invite email via Resend
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@rnr.ie"
  const fromName = process.env.RESEND_FROM_NAME || "R+R"

  // Safety net — log temp password to Railway console
  console.log(`Club Admin created: ${email.toLowerCase()} | Temp: ${tempPassword}`)

  let emailSent = false

  try {
    const emailResult = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: email.toLowerCase(),
      subject: "You've been set up as a Club Admin on R+R",
      text: `Hi ${firstName},

You've been added as the administrator for ${club.name} on R+R.

R+R is a sports supplement platform. As the club administrator, you can invite your members, track their orders, and manage your club account.

Here are your login details:

Website: ${appUrl}/login
Email: ${email.toLowerCase()}
Temporary Password: ${tempPassword}

When you log in for the first time, you'll be asked to set a new password.

If you have any questions, reply to this email.

— The R+R Team`,
    })

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
    } else {
      emailSent = true
    }
  } catch (emailError) {
    console.error("Failed to send invite email:", emailError)
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_CLUB_ADMIN",
      entityType: "User",
      entityId: newUser.id,
      metadata: {
        clubId,
        clubName: club.name,
        email: email.toLowerCase(),
      },
    },
  })

  const responseData: Record<string, unknown> = {
    success: true,
    email: newUser.email,
    emailSent,
  }

  // Only include tempPassword in response if email failed
  if (!emailSent) {
    responseData.tempPassword = tempPassword
    responseData.emailError = 'Email delivery failed'
  }

  return NextResponse.json(responseData, { status: 201 })
}
