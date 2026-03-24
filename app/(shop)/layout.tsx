import { ShopHeader } from "@/components/shop/ShopHeader"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500">
            &copy; 2025 R+R. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
