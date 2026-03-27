"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Profile", href: "/account" },
  { label: "My Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses", hideForRoles: ["CLUB_MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"] },
]

export function AccountNav({ role }: { role: string }) {
  const pathname = usePathname()

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-zinc-800 scrollbar-none">
      {tabs
        .filter((tab) => !tab.hideForRoles?.includes(role))
        .map((tab) => {
          const isActive =
            tab.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center",
                isActive
                  ? "border-white text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
    </nav>
  )
}
