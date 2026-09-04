import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { createAuthToken, COOKIE_NAME, MAX_AGE } from "@/lib/auth-session"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "registration_open")
      .single()

    if (setting?.value !== "true") {
      return NextResponse.json({ error: "Registration is closed" }, { status: 403 })
    }

    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()

    const { data: existing } = await supabase
      .from("accounts")
      .select("id")
      .eq("email", emailNorm)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    const { error: insertError } = await supabase
      .from("accounts")
      .insert({ email: emailNorm, password_hash: hash, is_admin: false })

    if (insertError) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }

    const token = await createAuthToken(emailNorm, false)
    const response = NextResponse.json({ success: true, email: emailNorm, isAdmin: false })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    })
    return response
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
