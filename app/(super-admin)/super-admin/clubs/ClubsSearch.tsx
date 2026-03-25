"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { Search } from "lucide-react"

interface Club {
  id: string
  name: string
  city: string
  contactEmail: string
  isActive: boolean
  memberCount: number
  discountPercentage: number
  discountEnabled: boolean
  revenueShareEnabled: boolean
}

export function ClubsSearch({ clubs }: { clubs: Club[] }) {
  const [search, setSearch] = useState("")

  const filtered = clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-zinc-700 bg-zinc-800 pl-9 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Club Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Contact Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Members</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Revenue Share</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No clubs found
                  </td>
                </tr>
              ) : (
                filtered.map((club) => (
                  <tr
                    key={club.id}
                    className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      <Link href={`/super-admin/clubs/${club.id}`} className="hover:underline">
                        {club.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{club.city}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{club.contactEmail}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{club.memberCount}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {club.discountEnabled ? `${club.discountPercentage}%` : "Off"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={club.revenueShareEnabled ? "ON" : "OFF"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={club.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/super-admin/clubs/${club.id}`}
                          className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/super-admin/clubs/${club.id}/settings`}
                          className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          Settings
                        </Link>
                      </div>
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
