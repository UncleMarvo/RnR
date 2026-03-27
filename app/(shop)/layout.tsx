import { ShopHeader } from "@/components/shop/ShopHeader"
import { MobileBottomNav } from "@/components/shop/MobileBottomNav"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <ShopHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm text-zinc-500">
              &copy; 2025 R+R. All rights reserved.
            </p>
            <a
              href="/privacy"
              className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
