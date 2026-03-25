import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPresignedUploadUrl } from "@/lib/r2"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { filename, contentType, productId } = body

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Invalid content type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    )
  }

  const ext = TYPE_EXTENSIONS[contentType]
  const key = `products/${productId || "new"}/${Date.now()}.${ext}`

  const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType)

  return NextResponse.json({ uploadUrl, publicUrl, key })
}
