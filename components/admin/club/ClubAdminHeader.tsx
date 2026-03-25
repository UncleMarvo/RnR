"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Menu } from "lucide-react"
import { ClubAdminNav } from "./ClubAdminNav"

export function ClubAdminHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: session } = useSession()

  const initials = session?.user
    ? `${session.user.firstName?.charAt(0) || ""}${session.user.lastName?.charAt(0) || ""}`
    : ""

  return (
    <>
      {/* Mobile header bar */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-zinc-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-white">
          R<span className="text-zinc-500">+</span>R
        </h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
          {initials}
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">
            <ClubAdminNav mobile onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
