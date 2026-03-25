"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatPrice } from "@/lib/utils"

interface RefundDialogProps {
  orderId: string
  maxAmount: number
  onSuccess?: () => void
}

export function RefundDialog({ orderId, maxAmount, onSuccess }: RefundDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > maxAmount) {
      toast.error(`Amount must be between €0.01 and ${formatPrice(maxAmount)}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, reason: reason || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to process refund")
        return
      }

      toast.success(`Refund of ${formatPrice(numAmount)} processed successfully`)
      setOpen(false)
      setAmount("")
      setReason("")
      onSuccess?.()
      router.refresh()
    } catch {
      toast.error("Failed to process refund")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Issue Refund
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Issue Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">
              Amount (max: {formatPrice(maxAmount)})
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for refund..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Processing..." : "Issue Refund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
