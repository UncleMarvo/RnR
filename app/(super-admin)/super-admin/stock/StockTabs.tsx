"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { StockAdjustForm } from "@/components/admin/super/StockAdjustForm"

interface Variant {
  id: string
  productName: string
  name: string
  sku: string
  stockQty: number
  lowStockThreshold: number
  isActive: boolean
}

interface Movement {
  id: string
  productName: string
  variantName: string
  type: string
  quantity: number
  qtyBefore: number
  qtyAfter: number
  reference: string | null
  notes: string | null
  createdAt: string
}

interface StockTabsProps {
  variants: Variant[]
  movements: Movement[]
}

export function StockTabs({ variants, movements }: StockTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"levels" | "history">("levels")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const tabs = [
    { key: "levels" as const, label: "Stock Levels" },
    { key: "history" as const, label: "Movement History" },
  ]

  function stockColor(qty: number, threshold: number) {
    if (qty === 0) return "text-red-400"
    if (qty <= threshold) return "text-amber-400"
    return "text-green-400"
  }

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.key
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "levels" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Variant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Threshold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                      No active variants
                    </td>
                  </tr>
                ) : (
                  variants.map((v) => (
                    <tr key={v.id}>
                      <td colSpan={7} className="p-0">
                        <div
                          className="grid border-b border-zinc-800 transition-colors hover:bg-zinc-800/50"
                          style={{ gridTemplateColumns: "1fr 1fr 1fr auto auto auto auto" }}
                        >
                          <div className="px-4 py-3 text-sm text-zinc-300">{v.productName}</div>
                          <div className="px-4 py-3 text-sm text-zinc-300">{v.name}</div>
                          <div className="px-4 py-3 text-sm font-mono text-zinc-400">{v.sku}</div>
                          <div className={cn("px-4 py-3 text-sm font-medium text-right", stockColor(v.stockQty, v.lowStockThreshold))}>
                            {v.stockQty}
                          </div>
                          <div className="px-4 py-3 text-sm text-zinc-400 text-right">{v.lowStockThreshold}</div>
                          <div className="px-4 py-3">
                            <StatusBadge status={v.isActive ? "ACTIVE" : "INACTIVE"} />
                          </div>
                          <div className="px-4 py-3 text-right">
                            <button
                              onClick={() => setExpandedRow(expandedRow === v.id ? null : v.id)}
                              className="text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                              {expandedRow === v.id ? "Close" : "Adjust Stock"}
                            </button>
                          </div>
                        </div>
                        {expandedRow === v.id && (
                          <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-800/30">
                            <StockAdjustForm
                              variantId={v.id}
                              currentQty={v.stockQty}
                              onSuccess={() => {
                                setExpandedRow(null)
                                router.refresh()
                              }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Product / Variant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Before → After</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                      No stock movements recorded
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const diff = m.qtyAfter - m.qtyBefore
                    return (
                      <tr key={m.id} className="border-b border-zinc-800 last:border-b-0">
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {new Date(m.createdAt).toLocaleDateString("en-IE")}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">
                          {m.productName} — {m.variantName}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={m.type} />
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-sm font-medium text-right",
                          diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-zinc-400"
                        )}>
                          {diff > 0 ? "+" : ""}{diff}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400 text-right">
                          {m.qtyBefore} → {m.qtyAfter}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400 font-mono">
                          {m.reference || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {m.notes || "—"}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
