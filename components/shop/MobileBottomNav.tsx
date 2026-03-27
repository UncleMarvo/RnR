"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SessionProvider, useSession } from "next-auth/react"
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react"
import { useCart } from "@/stores/cartStore"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Shop", icon: ShoppingBag, href: "/" },
  { label: "Cart", icon: ShoppingCart, href: "/cart" },
  { label: "Account", icon: User, href: "/account" },
]

export function MobileBottomNav() {
  return (
    <SessionProvider>
      <MobileBottomNavInner />
    </SessionProvider>
  )
}

function MobileBottomNavInner() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const totalItems = useCart((s) => s.totalItems)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getHref = (tab: (typeof tabs)[number]) => {
    if (tab.label === "Account") {
      return session?.user ? "/account" : "/login"
    }
    return tab.href
  }

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.label === "Home" || tab.label === "Shop") {
      return pathname === "/"
    }
    if (tab.label === "Cart") {
      return pathname === "/cart" || pathname.startsWith("/cart/")
    }
    if (tab.label === "Account") {
      return pathname.startsWith("/account") || pathname === "/login"
    }
    return false
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-zinc-800 bg-zinc-950 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab)
        const href = getHref(tab)
        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 min-h-[56px] justify-center relative",
              active ? "text-white" : "text-zinc-500"
            )}
          >
            <div className="relative">
              <tab.icon className="size-5" />
              {tab.label === "Cart" && mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
            {active && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
