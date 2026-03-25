import { prisma } from "@/lib/prisma"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
    select: { id: true, passwordResetExpiry: true },
  })

  const isValid = user && user.passwordResetExpiry && user.passwordResetExpiry > new Date()

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="space-y-2 text-center">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            R<span className="text-zinc-500">+</span>R
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Premium Sports Supplements</p>
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">
          {isValid ? "Set new password" : "Link expired"}
        </h2>
        {!isValid && (
          <p className="text-sm text-zinc-400">
            This reset link is invalid or has expired.
          </p>
        )}
      </CardHeader>

      {isValid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <CardFooter className="flex flex-col gap-4 pt-0">
          <Link href="/forgot-password" className="w-full">
            <Button variant="outline" className="w-full">
              Request a new reset link
            </Button>
          </Link>
          <Link
            href="/login"
            className="text-center text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Back to sign in
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
