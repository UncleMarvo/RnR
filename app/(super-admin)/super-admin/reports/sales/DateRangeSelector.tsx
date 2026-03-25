"use client"

import { useRouter, useSearchParams } from "next/navigation"

const ranges = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
]

interface DateRangeSelectorProps {
  basePath: string
}

export function DateRangeSelector({ basePath }: DateRangeSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("range") || "all"

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("range")
    } else {
      params.set("range", value)
    }
    const qs = params.toString()
    router.push(`${basePath}${qs ? `?${qs}` : ""}`)
  }

  return (
    <div className="flex gap-1">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => handleChange(r.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            current === r.value
              ? "bg-zinc-700 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
