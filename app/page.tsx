import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <h1 className="text-5xl font-bold tracking-tight text-white">
        R<span className="text-zinc-500">+</span>R
      </h1>
      <p className="mt-3 text-lg text-zinc-400">Coming Soon</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Shop
        </Link>
      </div>
    </div>
  )
}
