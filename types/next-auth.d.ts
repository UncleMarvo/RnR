import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "SUPER_ADMIN" | "CLUB_ADMIN" | "CLUB_MEMBER" | "PUBLIC"
      firstName: string
      lastName: string
      clubId: string | null
      clubName: string | null
      impersonatingClubId: string | null
      impersonatingClubName: string | null
      mustChangePassword: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    firstName: string
    lastName: string
    clubId: string | null
    clubName: string | null
    mustChangePassword: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    firstName: string
    lastName: string
    clubId: string | null
    clubName: string | null
    impersonatingClubId: string | null
    impersonatingClubName: string | null
    mustChangePassword: boolean
  }
}
