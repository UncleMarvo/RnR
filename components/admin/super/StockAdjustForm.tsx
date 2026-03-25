"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StockAdjustFormProps {
  variantId: string
  currentQty: number
  onSuccess: () => void
}

export function StockAdjustForm({ variantId, currentQty, onSuccess }: StockAdjustFormProps) {
  const [newQty, setNewQty] = useState(currentQty.toString())
  const [notes, setNotes] = useState("")
  const [movementType, setMovementType] = useState("ADJUSTMENT")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const qty = parseInt(newQty, 10)
    if (isNaN(qty) || qty < 0) {
      toast.error("Quantity must be a non-negative number")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockQty: qty,
          notes: notes || undefined,
          movementType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to adjust stock")
        return
      }

      toast.success("Stock adjusted successfully")
      setNotes("")
      onSuccess()
    } catch {
      toast.error("Failed to adjust stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-4 bg-zinc-800/50 rounded-lg">
      <div className="space-y-1">
        <Label className="text-xs text-zinc-400">New Quantity</Label>
        <Input
          type="number"
          min="0"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
          className="w-24 bg-zinc-800 border-zinc-700 text-white h-8 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-zinc-400">Type</Label>
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          className="h-8 rounded-md bg-zinc-800 border border-zinc-700 text-white px-2 text-sm"
        >
          <option value="PURCHASE">Purchase</option>
          <option value="ADJUSTMENT">Adjustment</option>
          <option value="RETURN">Return</option>
        </select>
      </div>
      <div className="flex-1 min-w-[150px] space-y-1">
        <Label className="text-xs text-zinc-400">Notes</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          className="bg-zinc-800 border-zinc-700 text-white h-8 text-sm"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading} className="h-8">
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
