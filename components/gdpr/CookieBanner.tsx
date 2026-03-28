"use client"

import { useState, useEffect } from "react"

const COOKIE_CONSENT_KEY = "rnr-cookie-consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) setVisible(true)
  }, [])

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 p-4 shadow-lg">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-zinc-400 text-sm flex-1">
          We use essential cookies to keep you logged in and your cart saved. No tracking or advertising cookies.{" "}
          <a
            href="/privacy"
            className="text-zinc-300 underline hover:text-white"
          >
            Privacy Policy
          </a>
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="shrink-0 bg-white text-black text-sm font-medium px-6 py-2 rounded-lg hover:bg-zinc-100 transition-colors whitespace-nowrap"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
