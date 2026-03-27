"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Shield,
  ShoppingBag,
  MoreHorizontal,
  Package,
  Warehouse,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomSheet } from "@/components/shared/BottomSheet"

const tabs = [
  { label: "Home", icon: LayoutDashboard, href: "/super-admin/dashboard" },
  { label: "Clubs", icon: Shield, href: "/super-admin/clubs" },
  { label: "Orders", icon: ShoppingBag, href: "/super-admin/orders" },
]

const moreLinks = [
  { label: "Products", icon: Package, href: "/super-admin/products" },
  { label: "Stock", icon: Warehouse, href: "/super-admin/stock" },
  { label: "Users", icon: Users, href: "/super-admin/users" },
  { label: "Reports", icon: BarChart3, href: "/super-admin/reports/sales" },
]

export function SuperAdminBottomNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const isMoreActive =
    moreLinks.some((l) => isActive(l.href))

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-zinc-800 bg-zinc-950 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 min-h-[56px] justify-center relative",
                active ? "text-white" : "text-zinc-500"
              )}
            >
              <tab.icon className="size-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
              )}
            </Link>
          )
        })}
        <button
          onClick={() => setSheetOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 min-h-[56px] justify-center relative",
            isMoreActive || sheetOpen ? "text-white" : "text-zinc-500"
          )}
        >
          <MoreHorizontal className="size-5" />
          <span className="text-[10px] font-medium">More</span>
          {isMoreActive && (
            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
          )}
        </button>
      </nav>

      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="More">
        <div className="space-y-1">
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSheetOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]",
                isActive(link.href)
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <link.icon className="size-5" />
              {link.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-zinc-800" />
          <button
            onClick={() => {
              setSheetOpen(false)
              signOut({ callbackUrl: "/login" })
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-zinc-800 min-h-[44px]"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
