import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { verifySession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, recipientId, message } = await request.json()
    if (!userId || !recipientId || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!(await verifySession(userId))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await getSupabaseServerClient()
    const { data: user } = await supabase.from("users").select("access_token, business_account_id").eq("id", userId).single()
    if (!user?.access_token) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const res = await fetch(`https://graph.facebook.com/v24.0/${user.business_account_id}/messages?access_token=${user.access_token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err?.error?.message || "Instagram API error" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DM] POST error:", error)
    return NextResponse.json({ error: "Failed to send DM" }, { status: 500 })
  }
}
