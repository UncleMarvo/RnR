import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const inviteRegisterBodySchema = z.object({
  token: z.string(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { club: { select: { name: true } } },
    })

    if (!invite) {
      return NextResponse.json({ valid: false, reason: "not_found" })
    }

    if (invite.status === "USED") {
      return NextResponse.json({ valid: false, reason: "used" })
    }

    if (invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: "expired" })
    }

    return NextResponse.json({
      valid: true,
      clubName: invite.club.name,
      sentToEmail: invite.sentToEmail,
    })
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: urlToken } = await params
    const body = await request.json()
    const parsed = inviteRegisterBodySchema.safeParse({ ...body, token: urlToken })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, firstName, lastName, email, password, phone } = parsed.data

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { club: { select: { name: true } } },
    })

    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite is no longer valid" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          passwordHash,
          phone: phone || null,
          role: "CLUB_MEMBER",
        },
      })

      await tx.clubMember.create({
        data: {
          userId: user.id,
          clubId: invite.clubId,
          inviteId: invite.id,
        },
      })

      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: "USED",
          usedAt: new Date(),
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
