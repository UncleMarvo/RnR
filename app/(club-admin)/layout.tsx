import { SessionProvider } from "next-auth/react"
import { ClubAdminNav } from "@/components/admin/club/ClubAdminNav"
import { ClubAdminHeader } from "@/components/admin/club/ClubAdminHeader"
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
        <div className="flex flex-1 flex-col">
          <ClubAdminHeader />
          <main className="flex-1 bg-zinc-900 px-6 py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
