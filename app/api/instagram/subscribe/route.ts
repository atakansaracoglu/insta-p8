import { NextResponse } from "next/server"
import { getSessionUserId, verifySession } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase-server"

const GRAPH = "https://graph.facebook.com/v24.0"

export async function POST() {
  const supabase = await getSupabaseServerClient()
  const userId = await getSessionUserId()

  if (!userId || !(await verifySession(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("access_token, business_account_id, page_id")
    .eq("id", userId)
    .single()

  if (error || !user?.access_token || !user.business_account_id || !user.page_id) {
    return NextResponse.json({ error: "Instagram connection incomplete" }, { status: 400 })
  }

  const post = (id: string, subscribed_fields: string[]) =>
    fetch(`${GRAPH}/${id}/subscribed_apps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: user.access_token, subscribed_fields }),
    })

  const instagram = await post(String(user.business_account_id), ["comments", "messages", "message_reactions", "message_edit", "live_comments"])

  if (!instagram.ok) {
    console.error(`[subscribe] Instagram subscription failed for user ${userId}: ${instagram.status} ${await instagram.text()}`)
    return NextResponse.json({ error: "Webhook subscription failed" }, { status: 502 })
  }

  console.log(`[subscribe] Instagram webhook subscription refreshed for user ${userId}: ${instagram.status}`)
  return NextResponse.json({ ok: true })
}
