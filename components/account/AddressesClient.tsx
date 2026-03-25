"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddressForm } from "@/components/account/AddressForm"
import { Plus } from "lucide-react"

interface Address {
  id: string
  label: string | null
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  county: string | null
  eircode: string | null
  country: string
  isDefault: boolean
}

export function AddressesClient({
  initialAddresses,
}: {
  initialAddresses: Address[]
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  async function refreshAddresses() {
    const res = await fetch("/api/addresses")
    if (res.ok) {
      const data = await res.json()
      setAddresses(data.addresses)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const body = await res.json()
        toast.error(body.error || "Failed to delete address")
        return
      }

      toast.success("Address deleted")
      await refreshAddresses()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefaultId(id)
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })

      if (!res.ok) {
        const body = await res.json()
        toast.error(body.error || "Failed to set default")
        return
      }

      toast.success("Default address updated")
      await refreshAddresses()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSettingDefaultId(null)
    }
  }

  function formatAddress(addr: Address) {
    return [addr.line1, addr.line2, addr.city, addr.county, addr.eircode, addr.country]
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showAddForm && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">No saved addresses yet.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
          {editingId === addr.id ? (
            <AddressForm
              address={addr}
              onSuccess={() => {
                setEditingId(null)
                refreshAddresses()
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-zinc-100">
                      {addr.label || "Address"}
                    </h3>
                    {addr.isDefault && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      >
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {formatAddress(addr)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(addr.id)}
                >
                  Edit
                </Button>
                {!addr.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefaultId === addr.id}
                  >
                    {settingDefaultId === addr.id
                      ? "Setting…"
                      : "Set as Default"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="text-red-400 hover:text-red-300"
                >
                  {deletingId === addr.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddForm ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-medium text-zinc-100">
            New Address
          </h3>
          <AddressForm
            onSuccess={() => {
              setShowAddForm(false)
              refreshAddresses()
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="mr-2 size-4" />
          Add New Address
        </Button>
      )}
    </div>
  )
}
