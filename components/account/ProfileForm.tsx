"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileFormProps {
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
    },
  })

  async function onSubmit(data: UpdateProfileInput) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        toast.error(body.error || "Failed to update profile")
        return
      }

      toast.success("Profile updated successfully")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-zinc-300">
            First Name
          </Label>
          <Input
            id="firstName"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm text-red-400">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-zinc-300">
            Last Name
          </Label>
          <Input
            id="lastName"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="border-zinc-700 bg-zinc-800/50 text-zinc-500"
        />
        <p className="text-xs text-zinc-500">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-zinc-300">
          Phone (optional)
        </Label>
        <Input
          id="phone"
          type="tel"
          className="border-zinc-700 bg-zinc-800 text-zinc-100"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-red-400">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
