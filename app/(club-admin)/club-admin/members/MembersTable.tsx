"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  joinedAt: string
  orderCount: number
  totalSpent: number
}

export function MembersTable({ members }: { members: Member[] }) {
  const [search, setSearch] = useState("")

  const filtered = members.filter((m) => {
    const term = search.toLowerCase()
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        />
        <button
          onClick={() => toast.info("Export CSV coming soon")}
          className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-zinc-500"
                  >
                    {search ? "No members match your search" : "No members yet"}
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {member.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(member.joinedAt).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {member.orderCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {formatPrice(member.totalSpent)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
