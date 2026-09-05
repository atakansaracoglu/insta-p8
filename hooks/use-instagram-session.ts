"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export function useInstagramSession() {
    const [username, setUsername] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [profilePic, setProfilePic] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let cancelled = false

        const init = async () => {
            // 1. Instant restore from localStorage (avoids flash)
            const savedId = localStorage.getItem("ig_user_id")
            const savedName = localStorage.getItem("ig_username")
            const savedPic = localStorage.getItem("ig_profile_pic")
            if (savedId && savedName) {
                setUserId(savedId)
                setUsername(savedName)
                setProfilePic(savedPic)
            }

            // 2. Validate against server-side httpOnly cookie
            try {
                const res = await fetch("/api/instagram/session")
                if (cancelled) return
                if (res.ok) {
                    const data = await res.json()
                    const uid = String(data.userId)
                    setUserId(uid)
                    setUsername(data.username || savedName)
                    setProfilePic(data.profilePic || savedPic || null)
                    localStorage.setItem("ig_user_id", uid)
                    if (data.username) localStorage.setItem("ig_username", data.username)
                    if (data.profilePic) localStorage.setItem("ig_profile_pic", data.profilePic)
                } else {
                    // Cookie invalid or missing — clear stale local state
                    localStorage.removeItem("ig_user_id")
                    localStorage.removeItem("ig_username")
                    localStorage.removeItem("ig_profile_pic")
                    if (!cancelled) {
                        setUserId(null)
                        setUsername(null)
                        setProfilePic(null)
                    }
                }
            } catch {
                // Network error — keep localStorage data if any
            }

            if (!cancelled) setIsLoading(false)
        }

        init()
        return () => { cancelled = true }
    }, [])

    const logout = useCallback(async () => {
        localStorage.removeItem("ig_user_id")
        localStorage.removeItem("ig_username")
        localStorage.removeItem("ig_profile_pic")
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
        setUsername(null)
        setUserId(null)
        setProfilePic(null)
        router.push("/")
    }, [router])

    return { userId, username, profilePic, isLoading, logout }
}
