"use client"

import { useState, useEffect } from "react"
import { Smartphone, X } from "lucide-react"
import {
  shouldShowInstallPrompt,
  markInstallPrompted,
  getDeviceType
} from "@/lib/pwa-utils"
import { InstallInstructionsModal } from "./InstallInstructionsModal"

interface Props {
  clubName: string
}

export function InstallNudge({ clubName }: Props) {
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'samsung' | 'desktop' | 'other'>('other')

  useEffect(() => {
    setDeviceType(getDeviceType())
    setVisible(shouldShowInstallPrompt())
  }, [])

  function handleShowMe() {
    markInstallPrompted()
    setVisible(false)
    setTimeout(() => setShowModal(true), 50)
  }

  function handleDismiss() {
    markInstallPrompted()
    setVisible(false)
  }

  return (
    <>
      {visible && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 relative">

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="bg-zinc-700 rounded-lg p-2 shrink-0">
              <Smartphone className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <p className="text-white text-sm font-medium">
                Get the best experience
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Add R+R to your home screen for quick access — just like a regular app.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShowMe}
            className="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
            Show me how →
          </button>
        </div>
      )}

      <InstallInstructionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deviceType={deviceType}
      />
    </>
  )
}
