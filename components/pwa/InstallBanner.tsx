"use client"

import { useState, useEffect } from "react"
import { X, Share, Plus } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISSED_KEY = "rnr-install-dismissed"

export function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) return

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
    if (isStandalone) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, "1")
  }

  const installAndroid = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      dismiss()
    }
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 rounded-xl bg-zinc-800 p-4 shadow-lg md:hidden">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Install R+R</p>
          {isIOS ? (
            <p className="mt-1 text-xs text-zinc-300">
              Tap <Share className="inline size-3.5 -mt-0.5" /> Share then{" "}
              <span className="font-medium">&ldquo;Add to Home Screen&rdquo;</span>{" "}
              <Plus className="inline size-3.5 -mt-0.5" /> for the best experience.
            </p>
          ) : (
            <div className="mt-2">
              <button
                onClick={installAndroid}
                className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 min-h-[44px]"
              >
                Install App
              </button>
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
