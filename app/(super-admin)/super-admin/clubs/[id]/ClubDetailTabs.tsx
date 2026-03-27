"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { createClubSchema, type CreateClubInput } from "@/lib/validations/admin"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/admin/shared/StatusBadge"
import { StatCard } from "@/components/admin/shared/StatCard"
import { CreateClubAdminForm } from "@/components/admin/super/CreateClubAdminForm"
import { Users, ShoppingBag, DollarSign, Trash2 } from "lucide-react"

interface ClubDetailTabsProps {
  club: {
    id: string
    name: string
    slug: string
    addressLine1: string
    addressLine2: string | null
    city: string
    county: string | null
    eircode: string | null
    country: string
    contactFirstName: string
    contactLastName: string
    contactEmail: string
    contactPhone: string | null
    isActive: boolean
    admins: Array<{
      id: string
      user: { id: string; email: string; firstName: string; lastName: string }
    }>
    members: Array<{
      id: string
      user: { id: string; email: string; firstName: string; lastName: string }
    }>
    orders: Array<{
      id: string
      orderNumber: string
      status: string
      total: number
      createdAt: string | Date
      user: { firstName: string; lastName: string }
    }>
    memberCount: number
    orderCount: number
    totalRevenue: number
  }
}

export function ClubDetailTabs({ club }: ClubDetailTabsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [, setAdminRefresh] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      name: club.name,
      slug: club.slug,
      addressLine1: club.addressLine1,
      addressLine2: club.addressLine2 || "",
      city: club.city,
      county: club.county || "",
      eircode: club.eircode || "",
      country: club.country,
      contactFirstName: club.contactFirstName,
      contactLastName: club.contactLastName,
      contactEmail: club.contactEmail,
      contactPhone: club.contactPhone || "",
    },
  })

  async function onSubmit(data: CreateClubInput) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || "Failed to update club")
        return
      }
      toast.success("Club updated successfully")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleActive() {
    setIsToggling(true)
    try {
      const res = await fetch(`/api/admin/clubs/${club.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !club.isActive }),
      })
      if (!res.ok) {
        toast.error("Failed to update status")
        return
      }
      toast.success(club.isActive ? "Club deactivated" : "Club activated")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsToggling(false)
    }
  }

  async function removeAdmin(userId: string) {
    try {
      const res = await fetch(`/api/admin/clubs/${club.id}/admins`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        toast.error("Failed to remove admin")
        return
      }
      toast.success("Admin removed")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="space-y-4">
      {/* Activate/Deactivate button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={toggleActive}
          disabled={isToggling}
          className={
            club.isActive
              ? "border-red-800 text-red-400 hover:bg-red-900/20"
              : "border-green-800 text-green-400 hover:bg-green-900/20"
          }
        >
          {isToggling
            ? "Updating..."
            : club.isActive
            ? "Deactivate"
            : "Activate"}
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-zinc-800">
          <TabsTrigger value="overview" className="text-zinc-300 data-active:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="text-zinc-300 data-active:text-white">
            Edit
          </TabsTrigger>
          <TabsTrigger value="admins" className="text-zinc-300 data-active:text-white">
            Admins
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6 pt-4">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Members" value={club.memberCount} icon={Users} />
              <StatCard label="Total Orders" value={club.orderCount} icon={ShoppingBag} />
              <StatCard
                label="Total Revenue"
                value={formatPrice(club.totalRevenue)}
                icon={DollarSign}
              />
            </div>

            {/* Club Details */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Club Details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-400">Name</dt>
                  <dd className="text-sm text-zinc-200">{club.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Slug</dt>
                  <dd className="text-sm text-zinc-200">{club.slug}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Address</dt>
                  <dd className="text-sm text-zinc-200">
                    {club.addressLine1}
                    {club.addressLine2 ? `, ${club.addressLine2}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">City</dt>
                  <dd className="text-sm text-zinc-200">
                    {club.city}{club.county ? `, ${club.county}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Contact</dt>
                  <dd className="text-sm text-zinc-200">
                    {club.contactFirstName} {club.contactLastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Email</dt>
                  <dd className="text-sm text-zinc-200">{club.contactEmail}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Status</dt>
                  <dd>
                    <StatusBadge status={club.isActive ? "ACTIVE" : "INACTIVE"} />
                  </dd>
                </div>
              </dl>
            </div>

            {/* Recent Orders */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="border-b border-zinc-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-800">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {club.orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      club.orders.map((order) => (
                        <tr key={order.id} className="border-b border-zinc-800 last:border-b-0">
                          <td className="px-4 py-3 text-sm font-medium text-white">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-sm text-zinc-300">
                            {order.user.firstName} {order.user.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-300">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-3 text-sm text-zinc-400">
                            {new Date(order.createdAt).toLocaleDateString("en-IE")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Members */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="border-b border-zinc-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Members ({club.memberCount})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-800">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {club.members.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-sm text-zinc-500">
                          No members yet
                        </td>
                      </tr>
                    ) : (
                      club.members.map((member) => (
                        <tr key={member.id} className="border-b border-zinc-800 last:border-b-0">
                          <td className="px-4 py-3 text-sm text-zinc-300">
                            {member.user.firstName} {member.user.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400">{member.user.email}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6 pt-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Club Details</h3>

              <div className="space-y-2">
                <Label className="text-zinc-300">Club Name *</Label>
                <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("name")} />
                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Slug *</Label>
                <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("slug")} />
                {errors.slug && <p className="text-sm text-red-400">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Address Line 1 *</Label>
                <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("addressLine1")} />
                {errors.addressLine1 && <p className="text-sm text-red-400">{errors.addressLine1.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Address Line 2</Label>
                <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("addressLine2")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">City *</Label>
                  <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("city")} />
                  {errors.city && <p className="text-sm text-red-400">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">County</Label>
                  <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("county")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Eircode</Label>
                  <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("eircode")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Country</Label>
                  <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("country")} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact Person</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">First Name *</Label>
                  <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("contactFirstName")} />
                  {errors.contactFirstName && <p className="text-sm text-red-400">{errors.contactFirstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Last Name *</Label>
                  <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("contactLastName")} />
                  {errors.contactLastName && <p className="text-sm text-red-400">{errors.contactLastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Email *</Label>
                <Input type="email" className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("contactEmail")} />
                {errors.contactEmail && <p className="text-sm text-red-400">{errors.contactEmail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Phone</Label>
                <Input type="tel" className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register("contactPhone")} />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <div className="space-y-6 pt-4">
            {/* Create Club Admin */}
            <CreateClubAdminForm
              clubId={club.id}
              clubName={club.name}
              onSuccess={() => {
                setAdminRefresh(prev => prev + 1)
                router.refresh()
              }}
            />

            {/* Current Admins */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="border-b border-zinc-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Current Admins</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-800">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {club.admins.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">
                          No admins assigned
                        </td>
                      </tr>
                    ) : (
                      club.admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-zinc-800 last:border-b-0">
                          <td className="px-4 py-3 text-sm text-zinc-300">
                            {admin.user.firstName} {admin.user.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400">{admin.user.email}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeAdmin(admin.user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
