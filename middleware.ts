import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/auth-session"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("advert_auth")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  const payload = await verifyAuthToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("advert_auth", "", { path: "/", maxAge: 0 })
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
