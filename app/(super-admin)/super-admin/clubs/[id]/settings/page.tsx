"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"

export const dynamic = 'force-dynamic'

interface ClubSettingsData {
  id: string
  clubId: string
  discountEnabled: boolean
  discountPercentage: number
  revenueShareEnabled: boolean
  revenueSharePercentage: number
  minimumOrderEnabled: boolean
  minimumOrderAmount: number
}

interface ClubData {
  stripeAccountId: string | null
  stripeOnboarded: boolean
}

export default function ClubSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.id as string

  const [settings, setSettings] = useState<ClubSettingsData | null>(null)
  const [club, setClub] = useState<ClubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, clubRes] = await Promise.all([
          fetch(`/api/admin/clubs/${clubId}/settings`),
          fetch(`/api/admin/clubs/${clubId}`),
        ])
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings(settingsData.settings)
        }
        if (clubRes.ok) {
          const clubData = await clubRes.json()
          setClub({
            stripeAccountId: clubData.club.stripeAccountId,
            stripeOnboarded: clubData.club.stripeOnboarded,
          })
        }
      } catch {
        toast.error("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [clubId])

  async function handleSave() {
    if (!settings) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountEnabled: settings.discountEnabled,
          discountPercentage: settings.discountPercentage,
          revenueShareEnabled: settings.revenueShareEnabled,
          revenueSharePercentage: settings.revenueSharePercentage,
          minimumOrderEnabled: settings.minimumOrderEnabled,
          minimumOrderAmount: settings.minimumOrderAmount,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to save settings")
        return
      }

      toast.success("Settings saved successfully")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStripeConnect() {
    setIsConnecting(true)
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/stripe-connect`, {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to start Stripe setup")
        return
      }

      window.location.href = data.onboardingUrl
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Settings not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Club Settings"
        description="Configure discount, revenue share, and order settings"
      />

      <div className="max-w-2xl space-y-6">
        {/* Discount Settings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Discount Settings</h2>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Enable Club Discount</Label>
              <p className="text-xs text-zinc-500 mt-1">
                This discount is applied silently at checkout for club members. It is not shown on product pages.
              </p>
            </div>
            <Switch
              checked={settings.discountEnabled}
              onCheckedChange={(checked) =>
                setSettings((s) => s ? { ...s, discountEnabled: !!checked } : s)
              }
            />
          </div>

          {settings.discountEnabled && (
            <div className="space-y-2">
              <Label className="text-zinc-300">Discount Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.discountPercentage}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, discountPercentage: parseFloat(e.target.value) || 0 } : s
                    )
                  }
                  className="w-24 border-zinc-700 bg-zinc-800 text-zinc-100"
                />
                <span className="text-zinc-400">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Share Settings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Revenue Share Settings</h2>

          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Enable Revenue Share</Label>
            <Switch
              checked={settings.revenueShareEnabled}
              onCheckedChange={(checked) =>
                setSettings((s) => s ? { ...s, revenueShareEnabled: !!checked } : s)
              }
            />
          </div>

          {settings.revenueShareEnabled && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-300">Revenue Share Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.revenueSharePercentage}
                    onChange={(e) =>
                      setSettings((s) =>
                        s ? { ...s, revenueSharePercentage: parseFloat(e.target.value) || 0 } : s
                      )
                    }
                    className="w-24 border-zinc-700 bg-zinc-800 text-zinc-100"
                  />
                  <span className="text-zinc-400">%</span>
                </div>
              </div>

              {/* Stripe Connect Status */}
              <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                <Label className="text-zinc-300 mb-2 block">Stripe Connect Status</Label>
                {club?.stripeAccountId && club?.stripeOnboarded ? (
                  <span className="inline-flex items-center rounded-full bg-green-900/50 px-3 py-1 text-sm text-green-400">
                    ✓ Connected to Stripe
                  </span>
                ) : club?.stripeAccountId && !club?.stripeOnboarded ? (
                  <div className="space-y-2">
                    <span className="inline-flex items-center rounded-full bg-yellow-900/50 px-3 py-1 text-sm text-yellow-400">
                      Onboarding incomplete
                    </span>
                    <div>
                      <Button
                        size="sm"
                        onClick={handleStripeConnect}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Loading..." : "Continue Setup"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="inline-flex items-center rounded-full bg-zinc-700 px-3 py-1 text-sm text-zinc-300">
                      Not connected
                    </span>
                    <div>
                      <Button
                        size="sm"
                        onClick={handleStripeConnect}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Loading..." : "Connect Stripe Account"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Minimum Order Settings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Minimum Order Settings</h2>

          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Enable Minimum Order</Label>
            <Switch
              checked={settings.minimumOrderEnabled}
              onCheckedChange={(checked) =>
                setSettings((s) => s ? { ...s, minimumOrderEnabled: !!checked } : s)
              }
            />
          </div>

          {settings.minimumOrderEnabled && (
            <div className="space-y-2">
              <Label className="text-zinc-300">Minimum Order Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">€</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={settings.minimumOrderAmount}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, minimumOrderAmount: parseFloat(e.target.value) || 0 } : s
                    )
                  }
                  className="w-32 border-zinc-700 bg-zinc-800 text-zinc-100"
                />
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
