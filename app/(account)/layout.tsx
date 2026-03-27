import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { MobileBottomNav } from "@/components/shop/MobileBottomNav"
import { AccountNav } from "@/components/account/AccountNav"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin =
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "CLUB_ADMIN"

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <ShopHeader />
      <main className="flex-1 pb-32 md:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <AccountNav role={session.user.role} />
          {children}
        </div>
      </main>
      {!isAdmin && <MobileBottomNav />}
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
