"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signOut } from "next-auth/react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lock } from "lucide-react"

const changePasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "At least 8 characters required")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmPassword,
  { message: "Passwords don't match", path: ["confirmPassword"] }
)

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export function ForceChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(data: ChangePasswordInput) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/account/change-password-forced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        setError(result.error || "Something went wrong. Please try again.")
        return
      }

      await signOut({ redirect: false })
      window.location.href = "/login?message=password-changed"
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
          <Lock className="h-6 w-6 text-zinc-300" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">
          Set Your New Password
        </h2>
        <p className="text-sm text-zinc-400">
          For your security, please set a new password before continuing.
          Your temporary password will no longer work after this.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-zinc-300">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-400">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-zinc-500">
              At least 8 characters, one uppercase letter, one number
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-300">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Setting password..." : "Set Password & Continue"}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
