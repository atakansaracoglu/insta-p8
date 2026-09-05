import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Instagram session (Facebook Login)
  const instaSession = request.cookies.get("insta_session")?.value
  if (instaSession) {
    try {
      const session = JSON.parse(instaSession)
      if (session.userId) return NextResponse.next()
    } catch {}
  }

  // Email/password session (admin)
  const advertAuth = request.cookies.get("advert_auth")?.value
  if (advertAuth && advertAuth.includes(".")) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL("/", request.url))
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
