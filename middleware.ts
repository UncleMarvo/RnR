import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const routeRules: Record<string, string[]> = {
  "/super-admin": ["SUPER_ADMIN"],
  "/club-admin": ["SUPER_ADMIN", "CLUB_ADMIN"],
  "/account": ["SUPER_ADMIN", "CLUB_ADMIN", "CLUB_MEMBER", "PUBLIC"],
  "/checkout": ["SUPER_ADMIN", "CLUB_ADMIN", "CLUB_MEMBER", "PUBLIC"],
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPER_ADMIN": return "/super-admin/dashboard"
    case "CLUB_ADMIN": return "/club-admin/dashboard"
    default: return "/"
  }
}

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  for (const [prefix, allowedRoles] of Object.entries(routeRules)) {
    if (pathname.startsWith(prefix)) {
      if (!session?.user) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.redirect(new URL("/unauthorised", req.url))
      }
    }
  }

  if (session?.user && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(
      new URL(getDashboardUrl(session.user.role), req.url)
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/club-admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
}
