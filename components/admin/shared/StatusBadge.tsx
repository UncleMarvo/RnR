import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  // Order statuses
  PENDING: "bg-zinc-700 text-zinc-300",
  PAID: "bg-blue-900/50 text-blue-400",
  PROCESSING: "bg-yellow-900/50 text-yellow-400",
  SHIPPED: "bg-purple-900/50 text-purple-400",
  DELIVERED: "bg-green-900/50 text-green-400",
  CANCELLED: "bg-red-900/50 text-red-400",
  REFUNDED: "bg-orange-900/50 text-orange-400",
  // Invite statuses
  USED: "bg-green-900/50 text-green-400",
  EXPIRED: "bg-red-900/50 text-red-400",
  REVOKED: "bg-zinc-700 text-zinc-300",
  // Revenue share statuses
  TRANSFERRED: "bg-green-900/50 text-green-400",
  // Generic
  ACTIVE: "bg-green-900/50 text-green-400",
  INACTIVE: "bg-zinc-700 text-zinc-300",
  ON: "bg-green-900/50 text-green-400",
  OFF: "bg-zinc-700 text-zinc-300",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-zinc-700 text-zinc-300"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </span>
  )
}
