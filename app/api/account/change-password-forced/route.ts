import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const schema = z.object({
  newPassword: z.string()
    .min(8, "At least 8 characters required")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmPassword,
  { message: "Passwords don't match", path: ["confirmPassword"] }
)

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input"
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { newPassword } = parsed.data

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  })

  return NextResponse.json({ success: true })
}
