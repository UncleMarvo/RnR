"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { addressSchema, type AddressFormData } from "@/lib/validations/checkout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface Address {
  id: string
  label: string | null
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  county: string | null
  eircode: string | null
  country: string
  isDefault: boolean
}

interface AddressFormProps {
  address?: Address
  onSuccess: () => void
  onCancel: () => void
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: address?.firstName || "",
      lastName: address?.lastName || "",
      line1: address?.line1 || "",
      line2: address?.line2 || "",
      city: address?.city || "",
      county: address?.county || "",
      eircode: address?.eircode || "",
      country: address?.country || "IE",
      label: address?.label || "",
      isDefault: address?.isDefault || false,
    },
  })

  const isDefault = watch("isDefault")

  async function onSubmit(data: AddressFormData) {
    setIsLoading(true)
    try {
      const url = address
        ? `/api/account/addresses/${address.id}`
        : "/api/addresses"
      const method = address ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        toast.error(body.error || "Failed to save address")
        return
      }

      toast.success(address ? "Address updated" : "Address added")
      onSuccess()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label" className="text-zinc-300">
          Label (optional)
        </Label>
        <Input
          id="label"
          placeholder="e.g. Home, Office"
          className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          {...register("label")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="addr-firstName" className="text-zinc-300">
            First Name
          </Label>
          <Input
            id="addr-firstName"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm text-red-400">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-lastName" className="text-zinc-300">
            Last Name
          </Label>
          <Input
            id="addr-lastName"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="line1" className="text-zinc-300">
          Address Line 1
        </Label>
        <Input
          id="line1"
          className="border-zinc-700 bg-zinc-800 text-zinc-100"
          {...register("line1")}
        />
        {errors.line1 && (
          <p className="text-sm text-red-400">{errors.line1.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="line2" className="text-zinc-300">
          Address Line 2 (optional)
        </Label>
        <Input
          id="line2"
          className="border-zinc-700 bg-zinc-800 text-zinc-100"
          {...register("line2")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-zinc-300">
            City
          </Label>
          <Input
            id="city"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("city")}
          />
          {errors.city && (
            <p className="text-sm text-red-400">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="county" className="text-zinc-300">
            County (optional)
          </Label>
          <Input
            id="county"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("county")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eircode" className="text-zinc-300">
            Eircode (optional)
          </Label>
          <Input
            id="eircode"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("eircode")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country" className="text-zinc-300">
            Country
          </Label>
          <Input
            id="country"
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            {...register("country")}
          />
          {errors.country && (
            <p className="text-sm text-red-400">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) =>
            setValue("isDefault", checked === true)
          }
        />
        <Label htmlFor="isDefault" className="text-sm text-zinc-300">
          Set as default address
        </Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : address ? "Update Address" : "Add Address"}
        </Button>
      </div>
    </form>
  )
}
