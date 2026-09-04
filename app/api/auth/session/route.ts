import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-session"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("advert_auth")?.value
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })
  const payload = await verifyAuthToken(token)
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 })
  return NextResponse.json({ authenticated: true, email: payload.email, isAdmin: payload.isAdmin })
}
