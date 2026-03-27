"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { slugify } from "@/lib/utils"
import { createProductSchema, type CreateProductInput } from "@/lib/validations/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface Props {
  product?: {
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    imageKey: string | null
    isActive: boolean
    sortOrder: number
  }
  mode: "create" | "edit"
}

export function ProductForm({ product, mode }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      sortOrder: product?.sortOrder ?? 0,
      isActive: product?.isActive ?? true,
      imageUrl: product?.imageUrl || null,
      imageKey: product?.imageKey || null,
    },
  })

  const name = watch("name")
  const slug = watch("slug")
  const isActive = watch("isActive")

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setValue("slug", slugify(name), { shouldValidate: true })
      setSlugAvailable(null)
    }
  }, [name, slugManuallyEdited, setValue])

  const checkSlugAvailability = useCallback(async () => {
    if (!slug || slug.length < 2) return
    try {
      const excludeParam = product?.id ? `&excludeId=${product.id}` : ""
      const res = await fetch(
        `/api/admin/products/check-slug?slug=${encodeURIComponent(slug)}${excludeParam}`
      )
      const data = await res.json()
      setSlugAvailable(data.available)
    } catch {
      setSlugAvailable(null)
    }
  }, [slug, product?.id])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed")
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    setPendingImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File): Promise<{
    publicUrl: string
    key: string
  }> {
    // Upload via server-side API route (bypasses R2 CORS)
    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("productId", product?.id || "new")

    const res = await fetch("/api/admin/products/upload", {
      method: "POST",
      body: uploadFormData,
      // Do NOT set Content-Type — browser sets it with boundary
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Upload failed")
    }

    const { publicUrl, key } = await res.json()
    return { publicUrl, key }
  }

  async function onSubmit(data: CreateProductInput) {
    setIsLoading(true)
    try {
      let imageUrl = data.imageUrl
      let imageKey = data.imageKey
      let oldImageKey: string | null = null

      // Upload pending image if exists
      if (pendingImageFile) {
        // Track old image for cleanup
        if (product?.imageKey) {
          oldImageKey = product.imageKey
        }
        const uploaded = await uploadImage(pendingImageFile)
        imageUrl = uploaded.publicUrl
        imageKey = uploaded.key
      }

      const payload = {
        ...data,
        imageUrl,
        imageKey,
        ...(oldImageKey ? { oldImageKey } : {}),
      }

      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product!.id}`

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to save product")
        return
      }

      if (mode === "create") {
        toast.success("Product created successfully")
        router.push(`/super-admin/products/${result.product.id}`)
      } else {
        toast.success("Product updated")
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Product Details</h2>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">
            Product Name *
          </Label>
          <Input
            id="name"
            placeholder="Whey Protein"
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-zinc-300">
            Slug *
          </Label>
          <Input
            id="slug"
            placeholder="whey-protein"
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            {...register("slug", {
              onChange: () => setSlugManuallyEdited(true),
            })}
            onBlur={checkSlugAvailability}
          />
          {slug && (
            <p className="text-xs text-zinc-500">URL: /products/{slug}</p>
          )}
          {slugAvailable === true && (
            <p className="text-xs text-green-400">Slug is available</p>
          )}
          {slugAvailable === false && (
            <p className="text-xs text-red-400">Slug is already taken</p>
          )}
          {errors.slug && (
            <p className="text-sm text-red-400">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-zinc-300">
            Description{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Product description..."
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-zinc-300">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              className="border-zinc-700 bg-zinc-800 text-zinc-100"
              {...register("sortOrder", { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <p className="text-sm text-red-400">
                {errors.sortOrder.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive" className="text-zinc-300">
              Active
            </Label>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Product Image</h2>

        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Product preview"
              className="max-w-[200px] rounded-lg border border-zinc-700"
            />
          </div>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? "Change Image" : "Upload Image"}
          </Button>
          <p className="mt-2 text-xs text-zinc-500">
            JPEG, PNG, or WebP. Max 2MB.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
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
  )
}
