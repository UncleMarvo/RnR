import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Minimal header — back to shop */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Shop
        </Link>
        <span className="font-bold text-white tracking-tight">R+R</span>
        <div className="w-24" />
      </header>

      {/* Existing card content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
