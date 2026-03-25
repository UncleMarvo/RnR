"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Shield,
  Package,
  ShoppingBag,
  Warehouse,
  Users,
  BarChart3,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Clubs", href: "/super-admin/clubs", icon: Shield },
  { label: "Products", href: "/super-admin/products", icon: Package },
  { label: "Orders", href: "/super-admin/orders", icon: ShoppingBag },
  { label: "Stock", href: "/super-admin/stock", icon: Warehouse },
  { label: "Users", href: "/super-admin/users", icon: Users },
  { label: "Reports", href: "/super-admin/reports/sales", icon: BarChart3 },
]

interface SuperAdminNavProps {
  mobile?: boolean
  onClose?: () => void
}

export function SuperAdminNav({ mobile, onClose }: SuperAdminNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-white">
            R<span className="text-zinc-500">+</span>R
          </h1>
          <p className="text-xs text-zinc-400">Super Admin</p>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-white bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 px-4 py-4">
        {session?.user && (
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-white">
              {session.user.firstName} {session.user.lastName}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {session.user.email}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
