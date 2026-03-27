import Link from "next/link"
import { SessionProvider } from "next-auth/react"
import { CartIconButton } from "./CartIconButton"
import { UserMenu } from "./UserMenu"
import { MobileNav } from "./MobileNav"

export function ShopHeader() {
  return (
    <SessionProvider>
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              R<span className="text-zinc-500">+</span>R
            </Link>
            <nav className="hidden md:flex">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Shop
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:items-center md:gap-2">
              <CartIconButton />
              <UserMenu />
            </div>
            {/* Mobile: cart icon only (account/login moves to bottom nav) */}
            <div className="flex items-center gap-2 md:hidden">
              <CartIconButton />
            </div>
          </div>
        </div>
      </header>
    </SessionProvider>
  )
}
