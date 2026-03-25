"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ShipmentFormProps {
  orderId: string
  shipment: {
    id: string
    status: string
    carrier: string | null
    trackingNumber: string | null
    trackingUrl: string | null
  } | null
}

export function ShipmentForm({ orderId, shipment }: ShipmentFormProps) {
  const router = useRouter()
  const [carrier, setCarrier] = useState(shipment?.carrier || "")
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber || "")
  const [trackingUrl, setTrackingUrl] = useState(shipment?.trackingUrl || "")
  const [status, setStatus] = useState(shipment?.status || "PENDING")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: carrier || null,
          trackingNumber: trackingNumber || null,
          trackingUrl: trackingUrl || null,
          status,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to update shipment")
        return
      }

      toast.success("Shipment updated successfully")
      router.refresh()
    } catch {
      toast.error("Failed to update shipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-zinc-300">Carrier</Label>
          <Input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="e.g. DPD, An Post"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300">Tracking Number</Label>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking number"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-zinc-300">Tracking URL</Label>
        <Input
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://..."
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-zinc-300">Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm"
        >
          <option value="PENDING">Pending</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="RETURNED">Returned</option>
        </select>
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Saving..." : "Save Shipment"}
      </Button>
    </form>
  )
}
