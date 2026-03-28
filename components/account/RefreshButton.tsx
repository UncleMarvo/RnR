"use client"

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="text-sm text-zinc-400 underline hover:text-zinc-300"
    >
      Refresh page
    </button>
  )
}
