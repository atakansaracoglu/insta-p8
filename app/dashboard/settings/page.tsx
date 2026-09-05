"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Loader2, Instagram } from "lucide-react"
import { useLang } from "@/components/lang-provider"
import { useInstagramSession } from "@/hooks/use-instagram-session"

export default function SettingsPage() {
  const { t } = useLang()
  const { username, userId } = useInstagramSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [regOpen, setRegOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/auth/settings").then((r) => r.json()),
    ])
      .then(([session, settings]) => {
        setIsAdmin(session.isAdmin ?? false)
        setEmail(session.email ?? "")
        setRegOpen(settings.registration_open ?? false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleRegistration = async () => {
    setToggling(true)
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_open: !regOpen }),
      })
      if (res.ok) setRegOpen(!regOpen)
    } catch {}
    setToggling(false)
  }

  const connectInstagram = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
    if (!clientId || !redirectUri) return
    const scopes = "instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_show_list,pages_read_engagement,business_management"
    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`
  }

  const disconnectInstagram = async () => {
    localStorage.removeItem("ig_user_id")
    localStorage.removeItem("ig_username")
    localStorage.removeItem("ig_profile_pic")
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("settings.description")}</p>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{t("settings.account")}</span>
          {isAdmin && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-yellow text-accent-yellow-foreground font-medium">
              Admin
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      {/* Instagram Connection */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Instagram className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{t("settings.instagram")}</span>
          {userId && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
              {t("settings.instagramConnected")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("settings.instagramDesc")}</p>

        {userId ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">@{username}</span>
            <button
              onClick={disconnectInstagram}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
            >
              {t("settings.instagramDisconnect")}
            </button>
          </div>
        ) : (
          <button
            onClick={connectInstagram}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-accent-yellow text-accent-yellow-foreground hover:opacity-90 transition-all"
          >
            <Instagram className="w-3.5 h-3.5" />
            {t("settings.instagramConnect")}
          </button>
        )}
      </div>

      {/* Registration Toggle — Admin only */}
      {isAdmin && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t("settings.registration")}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("settings.registrationDesc")}</p>
          <button
            onClick={toggleRegistration}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              regOpen
                ? "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/15"
                : "bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-accent"
            }`}
          >
            {toggling ? "..." : regOpen ? t("settings.registrationOpen") : t("settings.registrationClosed")}
          </button>
        </div>
      )}
    </div>
  )
}
