export const COOKIE_NAME = "advert_auth"
export const MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export interface AuthPayload {
  email: string
  isAdmin: boolean
  iat: number
  exp: number
}

const encoder = new TextEncoder()

function getSecret(): string {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  return s
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  const bytes = new Uint8Array(sig)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  )
  const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data))
}

export async function createAuthToken(email: string, isAdmin: boolean): Promise<string> {
  const payload: AuthPayload = {
    email,
    isAdmin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  }
  const data = btoa(JSON.stringify(payload))
  const sig = await hmacSign(data, getSecret())
  return `${data}.${sig}`
}

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const dot = token.indexOf(".")
    if (dot === -1) return null
    const data = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    if (!data || !sig) return null
    const valid = await hmacVerify(data, sig, getSecret())
    if (!valid) return null
    const payload: AuthPayload = JSON.parse(atob(data))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
