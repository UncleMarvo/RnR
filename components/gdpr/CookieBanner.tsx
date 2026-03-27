"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const COOKIE_CONSENT_KEY = "rnr-cookie-consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) setVisible(true)
  }, [])

  function dismiss(choice: "accepted" | "declined") {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-zinc-400 text-center sm:text-left">
          We use essential cookies to keep you logged in and your cart saved.
          No tracking or advertising cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => dismiss("declined")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => dismiss("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
