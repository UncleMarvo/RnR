"use client"

import { BottomSheet } from "@/components/shared/BottomSheet"
import { CheckCircle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  deviceType: 'ios' | 'android' | 'samsung' | 'desktop' | 'other'
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
              In Safari on iPhone:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Tap the Share button at the bottom of Safari",
                  detail: "It looks like a square with an arrow pointing up \u2191"
                },
                {
                  step: "2",
                  text: 'Scroll down and tap "Add to Home Screen"',
                  detail: "You may need to scroll the share menu to find it"
                },
                {
                  step: "3",
                  text: 'Tap "Add" in the top right corner',
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
                This only works in Safari. If you&apos;re using Chrome on iPhone, open this page in Safari first.
              </p>
            </div>
          </div>
        )}

        {deviceType === 'android' && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              In Chrome on Android:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Look for an install banner at the bottom of your screen",
                  detail: 'If you see "Add R+R to Home screen" \u2014 tap it!'
                },
                {
                  step: "2",
                  text: "Or tap the menu button \u22ee in the top right",
                  detail: "Look for three dots in the top right corner"
                },
                {
                  step: "3",
                  text: 'Tap "Add to Home screen" or "Install app"',
                  detail: "Either option will add R+R to your home screen"
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
                Once installed, R+R will appear on your home screen just like any other app.
              </p>
            </div>
          </div>
        )}

        {deviceType === 'samsung' && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              In Samsung Internet:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Tap the menu button at the bottom of your screen",
                  detail: "It looks like three horizontal lines \u2261"
                },
                {
                  step: "2",
                  text: 'Tap "Add page to" then "Home screen"',
                  detail: "This adds R+R to your home screen"
                },
                {
                  step: "3",
                  text: 'Tap "Add"',
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
          type="button"
          onClick={onClose}
          className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm">
          Done — take me to register
        </button>
      </div>
    </BottomSheet>
  )
}
