"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ImpersonationBanner() {
  const router = useRouter()
  const [impersonation, setImpersonation] = useState<{
    clubId: string
    clubName: string
  } | null>(null)

  useEffect(() => {
    async function checkImpersonation() {
      try {
        const res = await fetch("/api/impersonate")
        const data = await res.json()
        if (data.impersonating) {
          setImpersonation({
            clubId: data.clubId,
            clubName: data.clubName,
          })
        } else {
          setImpersonation(null)
        }
      } catch {
        setImpersonation(null)
      }
    }

    checkImpersonation()
  }, [])

  if (!impersonation) return null

  async function handleStop() {
    try {
      const res = await fetch("/api/impersonate/stop", { method: "POST" })
      if (res.ok) {
        setImpersonation(null)
        toast.success("Stopped impersonation")
        router.push("/super-admin/dashboard")
      } else {
        toast.error("Failed to stop impersonation")
      }
    } catch {
      toast.error("Failed to stop impersonation")
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-4">
        <span>
          ⚠ You are viewing as Club Admin: <strong>{impersonation.clubName}</strong>
        </span>
        <button
          onClick={handleStop}
          className="rounded bg-black/20 px-3 py-1 text-xs font-semibold hover:bg-black/30 transition-colors"
        >
          Stop Impersonating
        </button>
      </div>
    </div>
  )
}
