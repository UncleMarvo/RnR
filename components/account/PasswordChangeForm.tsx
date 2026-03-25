"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(data: ChangePasswordInput) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const body = await res.json()

      if (!res.ok) {
        toast.error(body.error || "Failed to change password")
        return
      }

      toast.success("Password changed successfully")
      reset()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-zinc-300">
          Current Password
        </Label>
        <Input
          id="currentPassword"
          type="password"
          className="border-zinc-700 bg-zinc-800 text-zinc-100"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-400">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-zinc-300">
          New Password
        </Label>
        <Input
          id="newPassword"
          type="password"
          className="border-zinc-700 bg-zinc-800 text-zinc-100"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-400">{errors.newPassword.message}</p>
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Changing…" : "Change Password"}
        </Button>
      </div>
    </form>
  )
}
