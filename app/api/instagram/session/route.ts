import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const raw = request.cookies.get("insta_session")?.value
  if (!raw) return NextResponse.json({ authenticated: false }, { status: 401 })
  try {
    const session = JSON.parse(raw)
    if (!session.userId) return NextResponse.json({ authenticated: false }, { status: 401 })
    return NextResponse.json({
      authenticated: true,
      userId: String(session.userId),
      username: session.username || null,
      profilePic: session.profilePic || null,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
