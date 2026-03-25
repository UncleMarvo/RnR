import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AddressesClient } from "@/components/account/AddressesClient"

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Only PUBLIC users can access addresses
  if (session.user.role !== "PUBLIC") {
    redirect("/account")
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })

  const serialised = JSON.parse(JSON.stringify(addresses))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Addresses</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your delivery addresses
        </p>
      </div>

      <AddressesClient initialAddresses={serialised} />
    </div>
  )
}
