import Link from "next/link"

export default function UnauthorisedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <h1 className="text-5xl font-bold tracking-tight text-white">
        R<span className="text-zinc-500">+</span>R
      </h1>
      <h2 className="mt-6 text-2xl font-semibold text-zinc-100">
        Access Denied
      </h2>
      <p className="mt-2 text-zinc-400">
        You don&apos;t have permission to view this page.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
      >
        Back to home
      </Link>
    </div>
  )
}
