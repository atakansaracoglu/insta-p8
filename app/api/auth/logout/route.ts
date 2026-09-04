import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set("advert_auth", "", { path: "/", maxAge: 0 })
  response.cookies.set("insta_session", "", { path: "/", maxAge: 0 })
  return response
}
