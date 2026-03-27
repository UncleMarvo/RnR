"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, ShoppingCart, Package, User, LogOut } from "lucide-react"
import { useHydratedCart } from "@/hooks/useHydratedCart"
import { useEffect } from "react"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { totalItems } = useHydratedCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800 md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <X className="size-5 text-zinc-300" />
        ) : (
          <Menu className="size-5 text-zinc-300" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950 md:hidden">
          <nav className="flex flex-col px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Shop
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-between rounded-lg px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Cart
              </span>
              {mounted && totalItems > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-zinc-900">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="my-2 h-px bg-zinc-800" />

            {session?.user ? (
              <>
                <div className="px-3 py-2 text-xs font-medium text-zinc-500">
                  {session.user.firstName} {session.user.lastName}
                </div>
                <Link
                  href="/account/orders"
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <Package className="size-4" />
                  My Orders
                </Link>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <User className="size-4" />
                  Account
                </Link>
                <button
                  onClick={() => {
                    setOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  className="flex h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-400 transition-colors hover:bg-zinc-800"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
