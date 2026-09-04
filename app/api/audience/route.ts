import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { verifySession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    if (!(await verifySession(userId))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await getSupabaseServerClient()

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("id, recipient_id, recipient_username, last_message_at, created_at")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })

    if (error) throw error

    // Get message counts per conversation in one query
    const convIds = (conversations || []).map((c: any) => c.id)
    let messageCounts: Record<string, { total: number; sent: number }> = {}

    if (convIds.length > 0) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("conversation_id, is_from_instagram")
        .eq("user_id", userId)
        .in("conversation_id", convIds)

      if (msgs) {
        for (const m of msgs) {
          if (!messageCounts[m.conversation_id]) messageCounts[m.conversation_id] = { total: 0, sent: 0 }
          messageCounts[m.conversation_id].total++
          if (!m.is_from_instagram) messageCounts[m.conversation_id].sent++
        }
      }
    }

    const audience = (conversations || []).map((c: any) => ({
      ...c,
      message_count: messageCounts[c.id]?.total || 0,
      bot_messages: messageCounts[c.id]?.sent || 0,
    }))

    return NextResponse.json(audience)
  } catch (error) {
    console.error("[Audience] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
