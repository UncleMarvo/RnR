"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"

const resetFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetFormInput = z.infer<typeof resetFormSchema>

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInput>({
    resolver: zodResolver(resetFormSchema),
  })

  async function onSubmit(data: ResetFormInput) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })

      if (!res.ok) {
        const body = await res.json()
        toast.error(body.error || "Failed to reset password")
        return
      }

      setSuccess(true)
      toast.success("Password reset successfully")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <CardFooter className="flex flex-col gap-4 pt-0">
        <p className="text-center text-sm text-zinc-400">
          Your password has been reset successfully.
        </p>
        <Link href="/login" className="w-full">
          <Button className="w-full">Login with your new password</Button>
        </Link>
      </CardFooter>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300">
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
          <p className="text-xs text-zinc-500">
            Min 8 characters, 1 uppercase letter, 1 number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-zinc-300">
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting…" : "Reset Password"}
        </Button>
        <Link
          href="/login"
          className="text-center text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </form>
  )
}
