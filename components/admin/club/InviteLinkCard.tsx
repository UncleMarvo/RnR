"use client"

import { useState, useEffect } from "react"
import { Link2, Copy, Check, MessageCircle } from "lucide-react"

interface InviteLinkCardProps {
  clubId: string
  clubName: string
}

export function InviteLinkCard({ clubId, clubName }: InviteLinkCardProps) {
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchPermanentLink() {
      try {
        const res = await fetch("/api/club-admin/invites/permanent-link")
        const data = await res.json()
        if (res.ok) {
          setRegistrationUrl(data.registrationUrl)
        } else {
          setError("Could not load your invite link. Please try refreshing the page.")
        }
      } catch {
        setError("Could not load your invite link. Please try refreshing the page.")
      } finally {
        setLoading(false)
      }
    }
    fetchPermanentLink()
  }, [clubId])

  async function handleCopy() {
    if (!registrationUrl) return
    try {
      await navigator.clipboard.writeText(registrationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = registrationUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleWhatsApp() {
    if (!registrationUrl) return
    const message = `Join R+R through ${clubName}: ${registrationUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-64 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-6">
        <p className="text-sm text-red-300">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 w-full overflow-hidden">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/30">
          <Link2 className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Your Club&apos;s Invite Link</h3>
          <p className="text-sm text-zinc-400">
            Share this link with your members. Anyone who signs up using this link will automatically be connected to your club.
          </p>
        </div>
      </div>

      {/* Link display + copy */}
      <div className="mb-4 flex items-center gap-2 min-w-0">
        <div className="flex-1 min-w-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2">
          <p className="truncate text-sm text-zinc-300 min-w-0">{registrationUrl}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* WhatsApp share */}
      <button
        onClick={handleWhatsApp}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        Share on WhatsApp
      </button>

      {copied && (
        <p className="mt-3 text-center text-sm text-green-400">
          Link copied! You can now paste it anywhere.
        </p>
      )}
    </div>
  )
}
