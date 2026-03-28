import { SessionProvider } from "next-auth/react"
import { ClubAdminNav } from "@/components/admin/club/ClubAdminNav"
import { ClubAdminHeader } from "@/components/admin/club/ClubAdminHeader"
import { ClubAdminBottomNav } from "@/components/admin/club/ClubAdminBottomNav"
import { ImpersonationBanner } from "@/components/admin/shared/ImpersonationBanner"

export default function ClubAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ImpersonationBanner />
      <div className="flex min-h-screen bg-zinc-950">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-zinc-800 lg:block">
          <div className="sticky top-0 h-screen">
            <ClubAdminNav />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          <ClubAdminHeader />
          <main className="flex-1 overflow-hidden w-full max-w-full bg-zinc-900 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <ClubAdminBottomNav />
    </SessionProvider>
  )
}
