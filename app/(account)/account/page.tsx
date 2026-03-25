import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/account/ProfileForm"
import { PasswordChangeForm } from "@/components/account/PasswordChangeForm"

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      clubMembership: {
        include: {
          club: {
            select: {
              name: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              county: true,
              eircode: true,
              country: true,
            },
          },
        },
      },
    },
  })

  if (!user) redirect("/login")

  const profileData = JSON.parse(JSON.stringify(user))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account details
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Personal Information
        </h2>
        <ProfileForm user={profileData} />
      </div>

      {user.role === "CLUB_MEMBER" && user.clubMembership?.club && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            Club Information
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-300">
              <span className="text-zinc-500">Your Club:</span>{" "}
              {user.clubMembership.club.name}
            </p>
            <p className="text-zinc-300">
              <span className="text-zinc-500">Delivery Address:</span>{" "}
              {[
                user.clubMembership.club.addressLine1,
                user.clubMembership.club.addressLine2,
                user.clubMembership.club.city,
                user.clubMembership.club.county,
                user.clubMembership.club.eircode,
                user.clubMembership.club.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              All your orders are delivered to your club address.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Change Password
        </h2>
        <PasswordChangeForm />
      </div>
    </div>
  )
}
