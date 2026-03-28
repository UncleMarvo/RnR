"use client"

import { useState } from "react"
import { Mail, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

interface EmailInviteFormProps {
  onSuccess: () => void
}

export function EmailInviteForm({ onSuccess }: EmailInviteFormProps) {
  const [expanded, setExpanded] = useState(false)
  const [emailsText, setEmailsText] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    sent: number
    failed: number
    details: Array<{ email: string; success: boolean; error?: string }>
  } | null>(null)

  const emails = emailsText
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.length > 0)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (emails.length === 0) return

    // Validate emails client-side
    const invalid = emails.filter((email) => !emailRegex.test(email))
    if (invalid.length > 0) {
      setResult({
        sent: 0,
        failed: invalid.length,
        details: invalid.map((email) => ({
          email,
          success: false,
          error: "Invalid email address",
        })),
      })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch("/api/club-admin/invites/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, expiryDays: 14 }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          sent: data.sent,
          failed: data.failed,
          details: data.results,
        })
        if (data.sent > 0) {
          setEmailsText("")
          onSuccess()
        }
      } else {
        setResult({
          sent: 0,
          failed: emails.length,
          details: emails.map((email) => ({
            email,
            success: false,
            error: data.error || "Something went wrong",
          })),
        })
      }
    } catch {
      setResult({
        sent: 0,
        failed: emails.length,
        details: emails.map((email) => ({
          email,
          success: false,
          error: "Something went wrong — please try again",
        })),
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
            <Mail className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Or send invites by email</h3>
            <p className="text-sm text-zinc-400">
              Send each person a personal invite email
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-zinc-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-400" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-zinc-800 px-6 py-5">
          <p className="mb-4 text-sm text-zinc-400">
            Enter your members&apos; email addresses below and we&apos;ll send them each a personal invite.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Email addresses (one per line)
              </label>
              <textarea
                value={emailsText}
                onChange={(e) => {
                  setEmailsText(e.target.value)
                  setResult(null)
                }}
                placeholder={"john@example.com\nmary@example.com"}
                rows={5}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
              {emails.length > 0 && (
                <p className="mt-1 text-xs text-zinc-400">
                  {emails.length} email address{emails.length !== 1 ? "es" : ""} entered
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending || emails.length === 0}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending {emails.length} invite{emails.length !== 1 ? "s" : ""}...
                </>
              ) : (
                `Send Invite${emails.length !== 1 ? "s" : ""}`
              )}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-4">
              {result.sent > 0 && (
                <div className="mb-3 rounded-lg border border-green-800/50 bg-green-900/20 px-4 py-3">
                  <p className="text-sm text-green-400">
                    {result.sent} invite{result.sent !== 1 ? "s" : ""} sent successfully!
                  </p>
                </div>
              )}
              {result.failed > 0 && (
                <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
                  <p className="text-sm text-red-400">
                    {result.sent > 0
                      ? `${result.failed} failed:`
                      : `Could not send ${result.failed} invite${result.failed !== 1 ? "s" : ""}:`}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.details
                      .filter((d) => !d.success)
                      .map((d, i) => (
                        <li key={i} className="text-xs text-red-300">
                          {d.email} — {d.error}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-zinc-500">
            We&apos;ll send each person a personal email with their invite link. You can see who&apos;s signed up in the Members section.
          </p>
        </div>
      )}
    </div>
  )
}
