"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SessionProvider, useSession, signOut } from "next-auth/react"
import { ShoppingBag, ShoppingCart, User, Package, ChevronRight, LogOut } from "lucide-react"
import { useHydratedCart } from "@/hooks/useHydratedCart"
import { BottomSheet } from "@/components/shared/BottomSheet"
import { cn } from "@/lib/utils"

const tabs = [
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
  const router = useRouter()
  const { data: session } = useSession()
  const { totalItems } = useHydratedCart()
  const [mounted, setMounted] = useState(false)
  const [showAccountSheet, setShowAccountSheet] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTabClick = (tab: (typeof tabs)[number], e: React.MouseEvent) => {
    if (tab.label === "Account") {
      e.preventDefault()
      if (session?.user) {
        setShowAccountSheet(true)
      } else {
        router.push("/login")
      }
    }
  }

  const getHref = (tab: (typeof tabs)[number]) => {
    if (tab.label === "Account") {
      return session?.user ? "/account" : "/login"
    }
    return tab.href
  }

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.label === "Shop") {
      return pathname === "/" || pathname.startsWith("/products")
    }
    if (tab.label === "Cart") {
      return pathname === "/cart" || pathname.startsWith("/checkout")
    }
    if (tab.label === "Account") {
      return pathname.startsWith("/account") || pathname === "/login"
    }
    return false
  }

  return (
    <>
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
              onClick={(e) => handleTabClick(tab, e)}
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

      {/* Account Bottom Sheet */}
      <BottomSheet
        isOpen={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
      >
        {session?.user && (
          <div className="space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-1 pb-3 border-b border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-zinc-400">{session.user.email}</p>
              </div>
            </div>

            {/* Navigation links */}
            <Link
              href="/account/orders"
              onClick={() => setShowAccountSheet(false)}
              className="flex h-12 items-center justify-between rounded-lg px-1 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <span className="flex items-center gap-3">
                <Package className="size-4 text-zinc-400" />
                My Orders
              </span>
              <ChevronRight className="size-4 text-zinc-500" />
            </Link>

            <Link
              href="/account"
              onClick={() => setShowAccountSheet(false)}
              className="flex h-12 items-center justify-between rounded-lg px-1 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <span className="flex items-center gap-3">
                <User className="size-4 text-zinc-400" />
                My Profile
              </span>
              <ChevronRight className="size-4 text-zinc-500" />
            </Link>

            {/* Sign out */}
            <div className="border-t border-zinc-800 pt-1 mt-1">
              <button
                onClick={() => {
                  setShowAccountSheet(false)
                  signOut({ callbackUrl: "/" })
                }}
                className="flex h-12 w-full items-center gap-3 rounded-lg px-1 text-sm font-medium text-red-400 transition-colors hover:bg-zinc-800"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
