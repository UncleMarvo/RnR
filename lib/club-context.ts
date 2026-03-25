import { cookies } from "next/headers"

export async function getClubContext(session: {
  user: {
    role: string
    clubId?: string | null
    clubName?: string | null
  }
}): Promise<{ clubId: string; clubName: string }> {
  if (session.user.role === "SUPER_ADMIN") {
    const cookieStore = await cookies()
    const impCookie = cookieStore.get("rnr-impersonating")
    if (!impCookie) {
      throw new Error("Super Admin must impersonate a club first")
    }
    const { clubId, clubName } = JSON.parse(impCookie.value)
    return { clubId, clubName }
  }
  if (session.user.role === "CLUB_ADMIN") {
    if (!session.user.clubId || !session.user.clubName) {
      throw new Error("Club Admin has no club assigned")
    }
    return {
      clubId: session.user.clubId,
      clubName: session.user.clubName,
    }
  }
  throw new Error("Unauthorised")
}
