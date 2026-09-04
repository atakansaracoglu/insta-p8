import { cookies } from "next/headers"

/**
 * Validate that the requested userId matches the session cookie.
 * Returns the verified userId or null if unauthorized.
 */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get("insta_session")?.value
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    return session.userId ? String(session.userId) : null
  } catch {
    return null
  }
}

/**
 * Verify that the given userId matches the session.
 * Use in API routes: if (!verifySession(requestedUserId)) return 401
 */
export async function verifySession(requestedUserId: string | null): Promise<boolean> {
  if (!requestedUserId) return false
  const sessionUserId = await getSessionUserId()
  return sessionUserId === requestedUserId
}
