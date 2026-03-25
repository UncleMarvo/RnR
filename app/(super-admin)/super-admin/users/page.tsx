import { prisma } from "@/lib/prisma"
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { UsersClient } from "./UsersClient"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      clubMembership: { include: { club: { select: { name: true } } } },
      clubAdmin: { include: { club: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    clubName:
      u.clubMembership?.club?.name ??
      u.clubAdmin?.club?.name ??
      null,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${users.length} user${users.length !== 1 ? "s" : ""} registered`}
      />

      <UsersClient users={serialized} />
    </div>
  )
}
