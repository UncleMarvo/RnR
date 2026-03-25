import { InviteForm } from "./invite-form"

export const dynamic = 'force-dynamic'

type InviteValidation =
  | { valid: true; clubName: string; sentToEmail: string | null }
  | { valid: false; reason: string }

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let invite: InviteValidation
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/invite/${token}`,
      { cache: "no-store" }
    )
    invite = await res.json()
  } catch {
    invite = { valid: false, reason: "not_found" }
  }

  return <InviteForm token={token} invite={invite} />
}
