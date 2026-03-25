"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const statuses = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
]

const deliveryTypes = [
  { label: "All", value: "" },
  { label: "Club", value: "CLUB" },
  { label: "Home", value: "HOME" },
]

const dateRanges = [
  { label: "All Time", value: "" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
]

export function OrdersFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page") // Reset page on filter change
      router.push(`/super-admin/orders?${params.toString()}`)
    },
    [router, searchParams]
  )

  const selectClass =
    "h-9 rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 text-sm"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("status") || ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className={selectClass}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("delivery") || ""}
        onChange={(e) => updateParam("delivery", e.target.value)}
        className={selectClass}
      >
        {deliveryTypes.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("range") || ""}
        onChange={(e) => updateParam("range", e.target.value)}
        className={selectClass}
      >
        {dateRanges.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search order # or name..."
        defaultValue={searchParams.get("search") || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateParam("search", (e.target as HTMLInputElement).value)
          }
        }}
        className="h-9 rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 text-sm placeholder-zinc-500 w-60"
      />
    </div>
  )
}
