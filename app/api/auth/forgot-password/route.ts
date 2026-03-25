import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"

export const dynamic = 'force-dynamic'

const forgotPasswordBodySchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      const token = crypto.randomUUID()
      const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: user.email,
        subject: "Reset your R+R password",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin-bottom: 16px;">Reset your password</h1>
            <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin-bottom: 24px;">
              Click the button below to reset your password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #18181b; color: #fafafa; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
              Reset Password
            </a>
            <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-top: 32px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      })
    }

    // Always return success to not leak email existence
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
