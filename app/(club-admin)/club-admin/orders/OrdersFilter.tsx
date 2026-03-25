"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const statuses = [
  "ALL",
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]

export function OrdersFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get("status") || "ALL")
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")

  function applyFilters() {
    const params = new URLSearchParams()
    if (status && status !== "ALL") params.set("status", status)
    if (search) params.set("search", search)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    router.push(`/club-admin/orders?${params.toString()}`)
  }

  function clearFilters() {
    setStatus("ALL")
    setSearch("")
    setFrom("")
    setTo("")
    router.push("/club-admin/orders")
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-zinc-400">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-zinc-600 focus:outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All Statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order # or member name"
          className="h-9 w-48 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-zinc-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-zinc-600 focus:outline-none"
        />
      </div>

      <button
        onClick={applyFilters}
        className="h-9 rounded-lg bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
      >
        Filter
      </button>
      <button
        onClick={clearFilters}
        className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
      >
        Clear
      </button>
    </div>
  )
}
