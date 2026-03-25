"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"

interface Invite {
  id: string
  sentToEmail: string | null
  status: string
  createdAt: string
  expiresAt: string
  claimedBy?: {
    user: { firstName: string; lastName: string }
  } | null
}

export function InvitesTable({ invites }: { invites: Invite[] }) {
  const router = useRouter()
  const [revoking, setRevoking] = useState<string | null>(null)

  async function handleRevoke(id: string) {
    setRevoking(id)
    try {
      const res = await fetch(`/api/club-admin/invites/${id}/revoke`, {
        method: "POST",
      })
      if (res.ok) {
        toast.success("Invite revoked")
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to revoke invite")
      }
    } catch {
      toast.error("Failed to revoke invite")
    } finally {
      setRevoking(null)
    }
  }

  const now = new Date()

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Sent To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Sent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Expires
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Used By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-zinc-500"
                >
                  No invites sent yet
                </td>
              </tr>
            ) : (
              invites.map((invite) => {
                const isExpired = new Date(invite.expiresAt) < now
                return (
                  <tr
                    key={invite.id}
                    className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {invite.sentToEmail || "Open invite"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          invite.status === "PENDING" && isExpired
                            ? "EXPIRED"
                            : invite.status
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(invite.createdAt).toLocaleDateString("en-IE")}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${
                        isExpired ? "text-red-400" : "text-zinc-400"
                      }`}
                    >
                      {new Date(invite.expiresAt).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {invite.claimedBy
                        ? `${invite.claimedBy.user.firstName} ${invite.claimedBy.user.lastName}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {invite.status === "PENDING" && !isExpired && (
                        <button
                          onClick={() => handleRevoke(invite.id)}
                          disabled={revoking === invite.id}
                          className="rounded bg-red-900/30 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/50 disabled:opacity-50"
                        >
                          {revoking === invite.id ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
