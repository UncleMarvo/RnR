"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

interface RevenueShareTransferProps {
  orderId: string
  clubName: string
  amount: number
}

export function RevenueShareTransfer({ orderId, clubName, amount }: RevenueShareTransferProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleTransfer() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/revenue-share/transfer`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to process transfer")
        return
      }
      toast.success(`Transferred ${formatPrice(amount)} to ${clubName}`)
      router.refresh()
    } catch {
      toast.error("Failed to process transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleTransfer} disabled={loading} size="sm" className="mt-2">
      {loading ? "Processing..." : "Process Transfer"}
    </Button>
  )
}

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-xs text-zinc-500 hover:text-zinc-300"
      title="Copy"
    >
      Copy
    </button>
  )
}
