import { SessionProvider } from "next-auth/react"
import { SuperAdminNav } from "@/components/admin/super/SuperAdminNav"
import { SuperAdminHeader } from "@/components/admin/super/SuperAdminHeader"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-zinc-950">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-zinc-800 lg:block">
          <div className="sticky top-0 h-screen">
            <SuperAdminNav />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <SuperAdminHeader />
          <main className="flex-1 bg-zinc-900 px-6 py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
