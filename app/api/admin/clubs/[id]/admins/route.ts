import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const admins = await prisma.clubAdmin.findMany({
    where: { clubId: id },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  })

  return NextResponse.json({ admins })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { email } = body

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { clubAdmin: true },
  })

  if (!user) {
    return NextResponse.json(
      { error: "No user found with that email address" },
      { status: 404 }
    )
  }

  if (user.clubAdmin) {
    return NextResponse.json(
      { error: "This user is already an admin of another club" },
      { status: 409 }
    )
  }

  const admin = await prisma.$transaction(async (tx) => {
    const newAdmin = await tx.clubAdmin.create({
      data: { userId: user.id, clubId: id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })

    if (user.role !== "CLUB_ADMIN" && user.role !== "SUPER_ADMIN") {
      await tx.user.update({
        where: { id: user.id },
        data: { role: "CLUB_ADMIN" },
      })
    }

    return newAdmin
  })

  return NextResponse.json({ admin }, { status: 201 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { userId } = body

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  await prisma.clubAdmin.delete({
    where: { userId, clubId: id },
  })

  // Check if user has any other club admin roles
  const otherAdminRoles = await prisma.clubAdmin.count({
    where: { userId },
  })

  if (otherAdminRoles === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PUBLIC" },
    })
  }

  return NextResponse.json({ success: true })
}
