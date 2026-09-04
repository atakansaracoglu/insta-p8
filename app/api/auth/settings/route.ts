import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { verifyAuthToken } from "@/lib/auth-session"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "registration_open")
      .single()
    return NextResponse.json({ registration_open: data?.value === "true" })
  } catch {
    return NextResponse.json({ registration_open: false })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("advert_auth")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verifyAuthToken(token)
    if (!payload?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { registration_open } = await request.json()
    const supabase = await getSupabaseServerClient()
    await supabase
      .from("app_settings")
      .upsert({
        key: "registration_open",
        value: String(!!registration_open),
        updated_at: new Date().toISOString(),
      })

    return NextResponse.json({ success: true, registration_open: !!registration_open })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
