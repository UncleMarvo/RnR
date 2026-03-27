import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ForceChangePasswordForm } from "@/components/auth/ForceChangePasswordForm"

export default async function ChangePasswordPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  if (!session.user.mustChangePassword) {
    if (session.user.role === 'SUPER_ADMIN') redirect('/super-admin/dashboard')
    if (session.user.role === 'CLUB_ADMIN') redirect('/club-admin/dashboard')
    redirect('/')
  }

  return <ForceChangePasswordForm />
}
