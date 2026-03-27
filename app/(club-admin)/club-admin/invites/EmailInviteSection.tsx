"use client"

import { useRouter } from "next/navigation"
import { EmailInviteForm } from "@/components/admin/club/EmailInviteForm"

export function EmailInviteSection() {
  const router = useRouter()

  return (
    <EmailInviteForm
      onSuccess={() => {
        router.refresh()
      }}
    />
  )
}
