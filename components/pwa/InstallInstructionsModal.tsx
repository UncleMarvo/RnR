"use client"

import { BottomSheet } from "@/components/shared/BottomSheet"
import { CheckCircle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  deviceType: 'ios' | 'android' | 'desktop' | 'other'
}

export function InstallInstructionsModal({
  isOpen,
  onClose,
  deviceType
}: Props) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add R+R to your home screen">

      <div className="space-y-6 pb-4">

        {deviceType === 'ios' && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Follow these steps in Safari:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Tap the Share button at the bottom of your screen",
                  detail: "It looks like a box with an arrow pointing up \u2191"
                },
                {
                  step: "2",
                  text: "Scroll down and tap \u201cAdd to Home Screen\u201d",
                  detail: "You may need to scroll the menu to find it"
                },
                {
                  step: "3",
                  text: "Tap \u201cAdd\u201d in the top right corner",
                  detail: "R+R will appear on your home screen"
                }
              ].map(({ step, text, detail }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{step}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">{text}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-zinc-400 text-xs">
                Make sure you&apos;re using Safari — this won&apos;t work in Chrome or other browsers on iPhone.
              </p>
            </div>
          </div>
        )}

        {deviceType === 'android' && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Follow these steps in Chrome:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Tap the menu button at the top of your screen",
                  detail: "It looks like three dots \u22ee in the top right"
                },
                {
                  step: "2",
                  text: "\u201cAdd to Home screen\u201d",
                  detail: "Tap this option from the menu"
                },
                {
                  step: "3",
                  text: "Tap \u201cAdd\u201d",
                  detail: "R+R will appear on your home screen"
                }
              ].map(({ step, text, detail }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{step}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">{text}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm">
          Done — take me to register
        </button>
      </div>
    </BottomSheet>
  )
}
