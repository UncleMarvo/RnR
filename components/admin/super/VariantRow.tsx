"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { updateVariantSchema, type UpdateVariantInput } from "@/lib/validations/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { Pencil, Trash2, ChevronUp } from "lucide-react"

interface VariantData {
  id: string
  name: string
  sku: string
  flavour: string | null
  size: string | null
  price: number
  stockQty: number
  lowStockThreshold: number
  isActive: boolean
  sortOrder: number
}

interface Props {
  variant: VariantData
  onUpdate: () => void
  onDelete: () => void
}

export function VariantRow({ variant, onUpdate, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [skuAvailable, setSkuAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateVariantInput>({
    resolver: zodResolver(updateVariantSchema),
    defaultValues: {
      name: variant.name,
      sku: variant.sku,
      flavour: variant.flavour || "",
      size: variant.size || "",
      price: variant.price,
      stockQty: variant.stockQty,
      lowStockThreshold: variant.lowStockThreshold,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
    },
  })

  const isActive = watch("isActive")

  const checkSkuAvailability = useCallback(async () => {
    const sku = watch("sku")
    if (!sku || sku.length < 2) return
    try {
      const res = await fetch(
        `/api/admin/variants/check-sku?sku=${encodeURIComponent(sku)}&excludeId=${variant.id}`
      )
      const data = await res.json()
      setSkuAvailable(data.available)
    } catch {
      setSkuAvailable(null)
    }
  }, [variant.id, watch])

  async function onSubmit(data: UpdateVariantInput) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to update variant")
        return
      }

      toast.success("Variant updated")
      setIsExpanded(false)
      onUpdate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/variants/${variant.id}`, {
        method: "DELETE",
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to delete variant")
        return
      }

      toast.success("Variant deleted")
      onDelete()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  function handleCancel() {
    reset()
    setIsExpanded(false)
    setSkuAvailable(null)
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      {/* Collapsed row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm font-medium text-white">
              {variant.name}
            </span>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-zinc-500">{variant.sku}</span>
              <span className="text-xs text-zinc-400">
                {formatPrice(variant.price)}
              </span>
              <span className="text-xs text-zinc-400">
                Stock: {variant.stockQty}
              </span>
              <StatusBadge
                status={variant.isActive ? "ACTIVE" : "INACTIVE"}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-zinc-400 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-zinc-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="border-t border-zinc-800 px-4 py-3 bg-red-950/20">
          <p className="text-sm text-zinc-300 mb-2">
            Are you sure you want to delete this variant?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Expanded edit form */}
      {isExpanded && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-t border-zinc-800 px-4 py-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Name *</Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">SKU *</Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("sku")}
                onBlur={checkSkuAvailability}
              />
              {skuAvailable === true && (
                <p className="text-xs text-green-400">SKU is available</p>
              )}
              {skuAvailable === false && (
                <p className="text-xs text-red-400">SKU is already taken</p>
              )}
              {errors.sku && (
                <p className="text-sm text-red-400">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">
                Flavour{" "}
                <span className="text-zinc-500 font-normal">(optional)</span>
              </Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("flavour")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">
                Size{" "}
                <span className="text-zinc-500 font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. 500g, 1kg"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("size")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Price *</Label>
              <Input
                type="number"
                step="0.01"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-400">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Stock Qty *</Label>
              <Input
                type="number"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("stockQty", { valueAsNumber: true })}
              />
              {errors.stockQty && (
                <p className="text-sm text-red-400">
                  {errors.stockQty.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Low Stock Threshold</Label>
              <Input
                type="number"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("lowStockThreshold", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Sort Order</Label>
              <Input
                type="number"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label className="text-zinc-300">Active</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
