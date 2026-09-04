import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { verifySession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    if (!(await verifySession(userId))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await getSupabaseServerClient()

    const [
      { data: messages },
      { data: automations },
      { count: totalContacts },
      { count: totalBotMessages },
      { count: totalReceived },
    ] = await Promise.all([
      supabase
        .from("messages")
        .select("created_at, is_from_instagram")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("automations")
        .select("id, name, trigger_count")
        .eq("user_id", userId)
        .order("trigger_count", { ascending: false })
        .limit(10),
      supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_from_instagram", false),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_from_instagram", true),
    ])

    // Group messages by day
    const daily: Record<string, { sent: number; received: number }> = {}
    for (const m of messages || []) {
      const day = m.created_at.slice(0, 10)
      if (!daily[day]) daily[day] = { sent: 0, received: 0 }
      if (m.is_from_instagram) daily[day].received++
      else daily[day].sent++
    }
    const messagesPerDay = Object.entries(daily)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      messagesPerDay,
      topAutomations: automations || [],
      totals: {
        contacts: totalContacts || 0,
        botMessages: totalBotMessages || 0,
        received: totalReceived || 0,
        triggers: (automations || []).reduce((s: number, a: any) => s + (a.trigger_count || 0), 0),
      },
    })
  } catch (error) {
    console.error("[Analytics] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
