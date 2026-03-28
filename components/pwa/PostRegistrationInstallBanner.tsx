"use client"

import { useState, useEffect } from "react"
import { Smartphone, X } from "lucide-react"
import {
  isInStandaloneMode,
  getDeviceType,
  markInstallPrompted
} from "@/lib/pwa-utils"
import { InstallInstructionsModal } from "./InstallInstructionsModal"

export function PostRegistrationInstallBanner() {
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'samsung' | 'desktop' | 'other'>('other')

  useEffect(() => {
    setDeviceType(getDeviceType())
    const alreadyShown = localStorage.getItem('rnr-post-reg-install-shown')
    if (
      !isInStandaloneMode() &&
      getDeviceType() !== 'desktop' &&
      !alreadyShown
    ) {
      setVisible(true)
      localStorage.setItem('rnr-post-reg-install-shown', 'true')
    }
  }, [])

  if (!visible) return null

  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 z-40 bg-zinc-800 border border-zinc-700 rounded-xl p-4 shadow-xl animate-in slide-in-from-bottom-4">

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <Smartphone className="w-5 h-5 text-zinc-300 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">
              Add R+R to your home screen
            </p>
            <p className="text-zinc-400 text-xs">
              Quick access, just like a real app
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowModal(true)
            markInstallPrompted()
            setVisible(false)
          }}
          className="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg py-2 transition-colors">
          Show me how →
        </button>
      </div>

      <InstallInstructionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deviceType={deviceType}
      />
    </>
  )
}
