"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  clubName: string | null
  isActive: boolean
  createdAt: string
}

interface UsersClientProps {
  users: User[]
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-900/50 text-purple-400",
  CLUB_ADMIN: "bg-blue-900/50 text-blue-400",
  CLUB_MEMBER: "bg-green-900/50 text-green-400",
  PUBLIC: "bg-zinc-700 text-zinc-300",
}

export function UsersClient({ users }: UsersClientProps) {
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState("")
  const [search, setSearch] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false
      if (search) {
        const term = search.toLowerCase()
        const matchesName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
        const matchesEmail = u.email.toLowerCase().includes(term)
        if (!matchesName && !matchesEmail) return false
      }
      return true
    })
  }, [users, roleFilter, search])

  async function toggleActive(userId: string, currentActive: boolean) {
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to update user")
        return
      }
      toast.success(`User ${currentActive ? "deactivated" : "activated"}`)
      router.refresh()
    } catch {
      toast.error("Failed to update user")
    } finally {
      setLoadingId(null)
    }
  }

  const selectClass = "h-9 rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 text-sm"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="CLUB_ADMIN">Club Admin</option>
          <option value="CLUB_MEMBER">Club Member</option>
          <option value="PUBLIC">Public</option>
        </select>
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 text-sm placeholder-zinc-500 w-60"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Club</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[user.role] || "bg-zinc-700 text-zinc-300"}`}>
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {user.clubName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== "SUPER_ADMIN" && (
                        <Button
                          variant={user.isActive ? "outline" : "default"}
                          size="sm"
                          disabled={loadingId === user.id}
                          onClick={() => toggleActive(user.id, user.isActive)}
                          className="text-xs"
                        >
                          {loadingId === user.id
                            ? "..."
                            : user.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                      )}
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
