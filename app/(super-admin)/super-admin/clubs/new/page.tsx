"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { slugify } from "@/lib/utils"
import { createClubSchema, type CreateClubInput } from "@/lib/validations/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"

export const dynamic = 'force-dynamic'

export default function CreateClubPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      country: "IE",
    },
  })

  const name = watch("name")
  const slug = watch("slug")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Auto-generate slug from name in real-time
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setValue("slug", slugify(name), { shouldValidate: true })
      setSlugAvailable(null)
    }
  }, [name, slugManuallyEdited, setValue])

  const checkSlugAvailability = useCallback(async () => {
    if (!slug || slug.length < 2) return
    try {
      const res = await fetch(`/api/admin/clubs/check-slug?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setSlugAvailable(data.available)
    } catch {
      setSlugAvailable(null)
    }
  }, [slug])

  async function onSubmit(data: CreateClubInput) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to create club")
        return
      }

      toast.success("Club created successfully")
      router.push(`/super-admin/clubs/${result.club.id}`)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create Club"
        description="Add a new club to the platform"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Club Details</h2>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Club Name *</Label>
            <Input
              id="name"
              placeholder="Sample FC"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-zinc-300">Slug *</Label>
            <Input
              id="slug"
              placeholder="sample-fc"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("slug", {
                onChange: () => setSlugManuallyEdited(true),
              })}
              onBlur={checkSlugAvailability}
            />
            {slug && (
              <p className="text-xs text-zinc-500">
                URL: /clubs/{slug}
              </p>
            )}
            {slugAvailable === true && (
              <p className="text-xs text-green-400">Slug is available</p>
            )}
            {slugAvailable === false && (
              <p className="text-xs text-red-400">Slug is already taken</p>
            )}
            {errors.slug && <p className="text-sm text-red-400">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Address</h2>

          <div className="space-y-2">
            <Label htmlFor="addressLine1" className="text-zinc-300">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("addressLine1")}
            />
            {errors.addressLine1 && <p className="text-sm text-red-400">{errors.addressLine1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2" className="text-zinc-300">
              Address Line 2 <span className="text-zinc-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="addressLine2"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("addressLine2")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-zinc-300">City *</Label>
              <Input
                id="city"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("city")}
              />
              {errors.city && <p className="text-sm text-red-400">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="county" className="text-zinc-300">
                County <span className="text-zinc-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="county"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("county")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eircode" className="text-zinc-300">
                Eircode <span className="text-zinc-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="eircode"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("eircode")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-zinc-300">Country</Label>
              <Input
                id="country"
                defaultValue="IE"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("country")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Contact Person</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactFirstName" className="text-zinc-300">First Name *</Label>
              <Input
                id="contactFirstName"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("contactFirstName")}
              />
              {errors.contactFirstName && (
                <p className="text-sm text-red-400">{errors.contactFirstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactLastName" className="text-zinc-300">Last Name *</Label>
              <Input
                id="contactLastName"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("contactLastName")}
              />
              {errors.contactLastName && (
                <p className="text-sm text-red-400">{errors.contactLastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-zinc-300">Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-400">{errors.contactEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-zinc-300">
              Phone <span className="text-zinc-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("contactPhone")}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Club"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
