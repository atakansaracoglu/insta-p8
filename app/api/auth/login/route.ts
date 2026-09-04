import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { createAuthToken, COOKIE_NAME, MAX_AGE } from "@/lib/auth-session"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const { data: account, error } = await supabase
      .from("accounts")
      .select("id, email, password_hash, is_admin")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (error || !account) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, account.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await createAuthToken(account.email, account.is_admin)
    const response = NextResponse.json({ success: true, email: account.email, isAdmin: account.is_admin })
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
