"use client"

import { Button } from "@/components/ui/button"
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog"
import { toast } from "sonner"
import { Download } from "lucide-react"

export function DataPrivacySection() {
  async function handleExport() {
    try {
      const res = await fetch("/api/account/export")
      if (!res.ok) {
        toast.error("Failed to export data")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "rnr-data-export.json"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        You can export all your personal data or permanently delete your account.
        See our{" "}
        <a href="/privacy" className="text-zinc-300 underline underline-offset-4 hover:text-white">
          Privacy Policy
        </a>{" "}
        for details on how we handle your data.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download data-icon="inline-start" />
          Export My Data
        </Button>
        <DeleteAccountDialog />
      </div>
    </div>
  )
}
