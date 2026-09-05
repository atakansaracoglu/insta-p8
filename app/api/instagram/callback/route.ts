import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

const GRAPH = "https://graph.facebook.com/v24.0"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const baseUrl = request.nextUrl.origin

  if (error) {
    return NextResponse.redirect(new URL(`/?ig_error=${encodeURIComponent(error)}`, baseUrl))
  }

  if (!code) {
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 })
  }

  const clientId = process.env.INSTAGRAM_APP_ID
  const clientSecret = process.env.INSTAGRAM_APP_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("[callback] Missing env vars: INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, or NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI")
    return NextResponse.redirect(new URL("/?ig_error=missing_config", baseUrl))
  }

  try {
    // 1. Exchange code for short-lived Facebook user token
    const tokenUrl = `${GRAPH}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${encodeURIComponent(code)}`
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      console.error("[callback] Token error:", JSON.stringify(tokenData.error))
      return NextResponse.redirect(new URL(`/?ig_error=${encodeURIComponent(tokenData.error.message || "token_failed")}`, baseUrl))
    }

    const shortUserToken = tokenData.access_token

    // 2. Exchange for long-lived user token
    const longUrl = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortUserToken}`
    const longRes = await fetch(longUrl)
    const longData = await longRes.json()
    const longUserToken = longData.access_token || shortUserToken
    console.log(`[callback] Long-lived user token obtained: ${!!longData.access_token}`)

    // 3. Get Facebook Pages the user manages
    const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${longUserToken}`)
    const pagesData = await pagesRes.json()

    if (!pagesData.data?.length) {
      console.error("[callback] No Facebook Pages found")
      return NextResponse.redirect(new URL("/?ig_error=no_pages", baseUrl))
    }

    console.log(`[callback] Found ${pagesData.data.length} Facebook Page(s)`)

    // 4. Find all pages with linked Instagram Business Accounts
    let pageAccessToken: string | null = null
    let pageId: string | null = null
    let igBusinessAccountId: string | null = null

    for (const page of pagesData.data) {
      const igRes = await fetch(`${GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`)
      const igData = await igRes.json()
      if (igData.instagram_business_account?.id) {
        pageAccessToken = page.access_token
        pageId = page.id
        igBusinessAccountId = igData.instagram_business_account.id
        console.log(`[callback] Found IG Business Account: ${igBusinessAccountId} on Page: ${page.name} (${page.id})`)
        break
      }
    }

    if (!pageAccessToken || !igBusinessAccountId || !pageId) {
      console.error("[callback] No Instagram Business Account linked to any page")
      return NextResponse.redirect(new URL("/?ig_error=no_ig_account", baseUrl))
    }

    // 5. Get Instagram username and profile pic
    let username = `user_${igBusinessAccountId}`
    let profilePic: string | null = null

    try {
      const profileRes = await fetch(`${GRAPH}/${igBusinessAccountId}?fields=username,profile_picture_url&access_token=${pageAccessToken}`)
      const profile = await profileRes.json()
      if (profile.username) username = profile.username
      if (profile.profile_picture_url) profilePic = profile.profile_picture_url
      console.log(`[callback] IG profile: @${username}`)
    } catch (e) {
      console.error("[callback] Profile fetch failed:", e)
    }

    // 6. Save/update user — match by business_account_id so reconnects update the same row
    const supabase = await getSupabaseServerClient()

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("business_account_id", igBusinessAccountId)
      .single()

    const userId = existingUser?.id || igBusinessAccountId

    const updates: Record<string, unknown> = {
      username,
      access_token: pageAccessToken,
      token_expires_at: null,
      updated_at: new Date().toISOString(),
      business_account_id: igBusinessAccountId,
      page_id: pageId,
    }

    console.log(`[callback] Saving: @${username} | userId=${userId} | igBiz=${igBusinessAccountId} | pageId=${pageId}`)

    const { error: upsertError } = await supabase
      .from("users")
      .upsert({ id: userId, ...updates }, { onConflict: "id" })

    if (upsertError) throw upsertError

    // 7. Subscribe this IG account to webhooks
    try {
      const subRes = await fetch(
        `${GRAPH}/${igBusinessAccountId}/subscribed_apps`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscribed_fields: ["comments", "messages", "message_reactions", "message_edit", "live_comments"],
            access_token: pageAccessToken,
          }),
        }
      )
      const subData = await subRes.json()
      console.log(`[callback] Webhook subscription:`, JSON.stringify(subData))
    } catch (e) {
      console.error("[callback] Webhook subscription failed:", e)
    }

    // 8. Set cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL("/dashboard", baseUrl))
    response.cookies.set("insta_session", JSON.stringify({
      username,
      userId: String(userId),
      profilePic,
    }), {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 60, // 60 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    return response

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown"
    console.error("[callback] Error:", error)
    return NextResponse.redirect(new URL(`/?ig_error=${encodeURIComponent(msg)}`, baseUrl))
  }
}

// Keep POST for backward compatibility (called by old client-side code)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body
    if (!code) return NextResponse.json({ error: "No code" }, { status: 400 })

    const clientId = process.env.INSTAGRAM_APP_ID
    const clientSecret = process.env.INSTAGRAM_APP_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing env vars")
    }

    const tokenUrl = `${GRAPH}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${encodeURIComponent(code)}`
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      if (tokenData.error.message?.includes("has already been used")) {
        return NextResponse.json({ error: "Code already used" }, { status: 400 })
      }
      return NextResponse.json({ error: tokenData.error.message || "Token failed" }, { status: 400 })
    }

    const shortUserToken = tokenData.access_token
    const longUrl = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortUserToken}`
    const longRes = await fetch(longUrl)
    const longData = await longRes.json()
    const longUserToken = longData.access_token || shortUserToken

    const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${longUserToken}`)
    const pagesData = await pagesRes.json()
    if (!pagesData.data?.length) {
      return NextResponse.json({ error: "No Facebook Pages found" }, { status: 400 })
    }

    let pageAccessToken: string | null = null
    let pageId: string | null = null
    let igBusinessAccountId: string | null = null
    for (const page of pagesData.data) {
      const igRes = await fetch(`${GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`)
      const igData = await igRes.json()
      if (igData.instagram_business_account?.id) {
        pageAccessToken = page.access_token
        pageId = page.id
        igBusinessAccountId = igData.instagram_business_account.id
        break
      }
    }

    if (!pageAccessToken || !igBusinessAccountId || !pageId) {
      return NextResponse.json({ error: "No Instagram Business Account found" }, { status: 400 })
    }

    let username = `user_${igBusinessAccountId}`
    let profilePic: string | null = null
    try {
      const profileRes = await fetch(`${GRAPH}/${igBusinessAccountId}?fields=username,profile_picture_url&access_token=${pageAccessToken}`)
      const profile = await profileRes.json()
      if (profile.username) username = profile.username
      if (profile.profile_picture_url) profilePic = profile.profile_picture_url
    } catch {}

    const supabase = await getSupabaseServerClient()
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("business_account_id", igBusinessAccountId)
      .single()

    const userId = existingUser?.id || igBusinessAccountId
    await supabase.from("users").upsert({
      id: userId,
      username,
      access_token: pageAccessToken,
      token_expires_at: null,
      updated_at: new Date().toISOString(),
      business_account_id: igBusinessAccountId,
      page_id: pageId,
    }, { onConflict: "id" })

    try {
      await fetch(`${GRAPH}/${igBusinessAccountId}/subscribed_apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribed_fields: ["comments", "messages", "message_reactions", "message_edit", "live_comments"],
          access_token: pageAccessToken,
        }),
      })
    } catch {}

    const response = NextResponse.json({ success: true, username, userId: String(userId), profilePic })
    response.cookies.set("insta_session", JSON.stringify({
      username,
      userId: String(userId),
      profilePic,
    }), {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    return response

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown"
    console.error("[callback] Error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
