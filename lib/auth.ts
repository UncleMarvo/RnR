import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            clubMembership: { include: { club: true } },
            clubAdmin: { include: { club: true } },
          },
        })

        if (!user || !user.passwordHash || !user.isActive) return null

        const passwordValid = await bcrypt.compare(password, user.passwordHash)
        if (!passwordValid) return null

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          clubId: user.clubMembership?.clubId
            ?? user.clubAdmin?.clubId
            ?? null,
          clubName:
            user.clubMembership?.club?.name ??
            user.clubAdmin?.club?.name ??
            null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.clubId = user.clubId ?? null
        token.clubName = user.clubName ?? null
        token.impersonatingClubId = null
        token.impersonatingClubName = null
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as "SUPER_ADMIN" | "CLUB_ADMIN" | "CLUB_MEMBER" | "PUBLIC"
      session.user.firstName = token.firstName as string
      session.user.lastName = token.lastName as string
      session.user.clubId = token.clubId as string | null
      session.user.clubName = token.clubName as string | null
      session.user.impersonatingClubId =
        (token.impersonatingClubId as string | null) ?? null
      session.user.impersonatingClubName =
        (token.impersonatingClubName as string | null) ?? null
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
})
