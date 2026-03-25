"use client"

import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { formatPrice } from "@/lib/utils"

interface ClubSettingsViewProps {
  club: {
    name: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    county?: string | null
    eircode?: string | null
    country: string
    contactFirstName: string
    contactLastName: string
    contactEmail: string
    contactPhone?: string | null
  }
  settings: {
    discountEnabled: boolean
    discountPercentage: number
    revenueShareEnabled: boolean
    revenueSharePercentage: number
    minimumOrderEnabled: boolean
    minimumOrderAmount: number
  } | null
  stripeOnboarded: boolean
}

export function ClubSettingsView({
  club,
  settings,
  stripeOnboarded,
}: ClubSettingsViewProps) {
  return (
    <div className="space-y-8">
      {/* Club Details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Club Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Club Name
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{club.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Contact
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {club.contactFirstName} {club.contactLastName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Email
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{club.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Phone
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {club.contactPhone || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Address
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {club.addressLine1}
              {club.addressLine2 && `, ${club.addressLine2}`}
              <br />
              {club.city}
              {club.county && `, ${club.county}`}
              {club.eircode && ` ${club.eircode}`}
              <br />
              {club.country}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-zinc-500">
          To update club details, contact R+R admin.
        </p>
      </div>

      {/* Current Settings */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Current Settings
        </h2>
        {settings ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Member Discount
                </p>
                {settings.discountEnabled && (
                  <p className="text-xs text-zinc-400">
                    {settings.discountPercentage}% discount for club members
                  </p>
                )}
              </div>
              <StatusBadge
                status={settings.discountEnabled ? "ON" : "OFF"}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Revenue Share</p>
                {settings.revenueShareEnabled && (
                  <p className="text-xs text-zinc-400">
                    {settings.revenueSharePercentage}% share on member orders
                  </p>
                )}
              </div>
              <StatusBadge
                status={settings.revenueShareEnabled ? "ON" : "OFF"}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Minimum Order</p>
                {settings.minimumOrderEnabled && (
                  <p className="text-xs text-zinc-400">
                    Minimum {formatPrice(settings.minimumOrderAmount)} per order
                  </p>
                )}
              </div>
              <StatusBadge
                status={settings.minimumOrderEnabled ? "ON" : "OFF"}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Stripe Connect
                </p>
                <p className="text-xs text-zinc-400">
                  {stripeOnboarded
                    ? "Connected — payouts enabled"
                    : "Not connected"}
                </p>
              </div>
              <StatusBadge status={stripeOnboarded ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No settings configured yet.</p>
        )}
        <p className="mt-4 text-xs text-zinc-500">
          Settings are managed by R+R admin. Contact us for changes.
        </p>
      </div>
    </div>
  )
}
