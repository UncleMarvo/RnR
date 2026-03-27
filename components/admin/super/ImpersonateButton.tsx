"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  clubId: string
  clubName: string
}

export function ImpersonateButton({ clubId, clubName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleImpersonate() {
    setLoading(true)
    try {
      const response = await fetch("/api/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to impersonate")
      }

      toast.success(`Now viewing as ${clubName} admin`)
      router.push("/club-admin/dashboard")

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start impersonation"
      )
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleImpersonate}
      disabled={loading}
      className="border-amber-500 text-amber-500
        hover:bg-amber-500 hover:text-black"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserCheck className="mr-2 h-4 w-4" />
      )}
      {loading ? "Starting..." : "Impersonate"}
    </Button>
  )
}
