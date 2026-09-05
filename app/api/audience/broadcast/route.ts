import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { verifySession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, recipientIds, message } = await request.json()
    if (!userId || !Array.isArray(recipientIds) || !recipientIds.length || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!(await verifySession(userId))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await getSupabaseServerClient()
    const { data: user } = await supabase.from("users").select("access_token, business_account_id").eq("id", userId).single()
    if (!user?.access_token) return NextResponse.json({ error: "User not found" }, { status: 404 })

    let sent = 0
    let failed = 0
    // ponytail: sequential sends with 1s delay to respect IG rate limits; batch queue when scale matters
    for (const rid of recipientIds.slice(0, 100)) {
      try {
        const res = await fetch(`https://graph.facebook.com/v24.0/${user.business_account_id}/messages?access_token=${user.access_token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: { id: rid }, message: { text: message } }),
        })
        if (res.ok) sent++
        else failed++
      } catch {
        failed++
      }
      if (sent + failed < recipientIds.length) await new Promise(r => setTimeout(r, 1000))
    }

    return NextResponse.json({ success: true, sent, failed })
  } catch (error) {
    console.error("[Broadcast] POST error:", error)
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 })
  }
}
