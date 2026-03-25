"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import Link from "next/link"

type Tab = "single" | "bulk"

export default function NewInvitePage() {
  const [activeTab, setActiveTab] = useState<Tab>("single")

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Send Invites"
        description="Invite new members to join your club"
        action={
          <Link
            href="/club-admin/invites"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            ← Back to Invites
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "single"
              ? "bg-zinc-700 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Single Invite
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "bulk"
              ? "bg-zinc-700 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Bulk Invite
        </button>
      </div>

      {activeTab === "single" ? <SingleInviteForm /> : <BulkInviteForm />}
    </div>
  )
}

function SingleInviteForm() {
  const [email, setEmail] = useState("")
  const [expiryDays, setExpiryDays] = useState(14)
  const [sending, setSending] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setInviteLink(null)

    try {
      const res = await fetch("/api/club-admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          expiryDays,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setInviteLink(data.registrationLink)
        toast.success(
          email ? "Invite sent successfully" : "Open invite created"
        )
        setEmail("")
      } else {
        toast.error(data.error || "Failed to send invite")
      }
    } catch {
      toast.error("Failed to send invite")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Email Address (optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com — leave blank for open invite"
            className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Expires In
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-zinc-600 focus:outline-none"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {sending ? "Sending..." : email ? "Send Invite" : "Create Open Invite"}
        </button>
      </form>

      {inviteLink && (
        <div className="mt-6 rounded-lg border border-green-800/50 bg-green-900/20 p-4">
          <p className="mb-2 text-sm font-medium text-green-400">
            Share this link:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="h-9 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink)
                toast.success("Link copied to clipboard")
              }}
              className="shrink-0 rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-600"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BulkInviteForm() {
  const [emailsText, setEmailsText] = useState("")
  const [expiryDays, setExpiryDays] = useState(14)
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<{
    sent: number
    failed: number
    details: Array<{ email: string; success: boolean; error?: string }>
  } | null>(null)

  const emails = emailsText
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.length > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (emails.length === 0) {
      toast.error("Please enter at least one email address")
      return
    }
    if (emails.length > 100) {
      toast.error("Maximum 100 emails per bulk send")
      return
    }

    setSending(true)
    setResults(null)

    try {
      const res = await fetch("/api/club-admin/invites/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, expiryDays }),
      })

      const data = await res.json()

      if (res.ok) {
        setResults({
          sent: data.sent,
          failed: data.failed,
          details: data.results,
        })
        toast.success(`${data.sent} invite${data.sent !== 1 ? "s" : ""} sent`)
        if (data.sent > 0) setEmailsText("")
      } else {
        toast.error(data.error || "Failed to send invites")
      }
    } catch {
      toast.error("Failed to send invites")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Email Addresses (one per line)
          </label>
          <textarea
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            placeholder={"john@example.com\njane@example.com\n..."}
            rows={8}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
          {emails.length > 0 && (
            <p className="mt-1 text-xs text-zinc-400">
              {emails.length} invite{emails.length !== 1 ? "s" : ""} will be
              sent
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Expires In
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-zinc-600 focus:outline-none"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={sending || emails.length === 0}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {sending ? "Sending..." : `Send All (${emails.length})`}
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="text-green-400">
              {results.sent} sent
            </span>
            {results.failed > 0 && (
              <span className="text-red-400">
                {results.failed} failed
              </span>
            )}
          </div>
          {results.details.some((d) => !d.success) && (
            <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3">
              <p className="mb-2 text-xs font-medium text-red-400">
                Failed invites:
              </p>
              <ul className="space-y-1">
                {results.details
                  .filter((d) => !d.success)
                  .map((d, i) => (
                    <li key={i} className="text-xs text-red-300">
                      {d.email}: {d.error}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
