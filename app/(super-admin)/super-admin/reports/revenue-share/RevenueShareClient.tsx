"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function ProcessAllButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleProcessAll() {
    if (!confirm("Process all pending revenue share transfers?")) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/revenue-share/process-all", {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to process transfers")
        return
      }
      toast.success(`Processed: ${data.processed}, Failed: ${data.failed}`)
      if (data.errors?.length > 0) {
        data.errors.forEach((err: string) => toast.error(err))
      }
      router.refresh()
    } catch {
      toast.error("Failed to process transfers")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleProcessAll} disabled={loading} size="sm">
      {loading ? "Processing..." : "Process All Pending"}
    </Button>
  )
}

export function ProcessTransferButton({ orderId, clubName, amount }: {
  orderId: string
  clubName: string
  amount: string
}) {
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
      toast.success(`Transferred ${amount} to ${clubName}`)
      router.refresh()
    } catch {
      toast.error("Failed to process transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleTransfer}
      disabled={loading}
      className="text-xs text-blue-400 hover:text-blue-300 disabled:text-zinc-500"
    >
      {loading ? "..." : "Transfer"}
    </button>
  )
}
