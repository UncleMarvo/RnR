"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClubAdminSchema, type CreateClubAdminInput } from "@/lib/validations/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"

interface CreateClubAdminFormProps {
  clubId: string
  clubName: string
  onSuccess: () => void
}

export function CreateClubAdminForm({ clubId, clubName, onSuccess }: CreateClubAdminFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    firstName: string
    lastName: string
    email: string
    emailSent: boolean
    tempPassword?: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubAdminInput>({
    resolver: zodResolver(createClubAdminSchema),
  })

  async function onSubmit(data: CreateClubAdminInput) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/admins/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setError("An account with this email already exists. If this person needs access, contact R+R support.")
        } else {
          setError(result.error || "Something went wrong. Please try again.")
        }
        return
      }

      setSuccess({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        emailSent: result.emailSent !== false,
        tempPassword: result.tempPassword,
      })
      reset()

      // Give more time if email failed so admin can copy credentials
      setTimeout(() => {
        onSuccess()
      }, result.emailSent !== false ? 3000 : 15000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-1 text-lg font-semibold text-white">
        Add a Club Administrator
      </h3>
      <p className="mb-4 text-sm text-zinc-400">
        Create an account for the person who will manage this club.
        They&apos;ll receive an email with instructions to log in.
      </p>

      {success && (
        <div className={`mb-4 rounded-md border px-4 py-3 text-sm ${
          success.emailSent
            ? "border-green-800 bg-green-900/20 text-green-400"
            : "border-yellow-800 bg-yellow-900/20 text-yellow-400"
        }`}>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                Account created for {success.firstName} {success.lastName}
              </p>
              {success.emailSent ? (
                <p className="mt-1 text-green-400/80">
                  An invite email has been sent to {success.email}
                </p>
              ) : (
                <div className="mt-1 space-y-2">
                  <p className="text-yellow-400/80">
                    &#9888; Email could not be sent to {success.email}
                  </p>
                  <p className="text-yellow-400/80">
                    Please share these login details manually:
                  </p>
                  <div className="rounded bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-200">
                    <p>Login URL: {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login</p>
                    <p>Email: {success.email}</p>
                    {success.tempPassword && (
                      <p>Temporary Password: {success.tempPassword}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">First Name *</Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                placeholder="Jane"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Last Name *</Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                placeholder="Smith"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Email Address *</Label>
            <Input
              type="email"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              placeholder="jane@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Admin Account & Send Invite"}
          </Button>
        </form>
      )}
    </div>
  )
}
