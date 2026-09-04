"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import {
  Zap, LayoutDashboard, LogOut, Settings, BarChart3,
  MessageSquare, Snowflake, Send, Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { useLang } from "@/components/lang-provider"

const NAV_KEYS = [
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.overview" },
  { href: "/dashboard/automations", icon: Zap, key: "nav.automations" },
  { href: "/dashboard/inbox", icon: MessageSquare, key: "nav.inbox" },
  { href: "/dashboard/ice-breakers", icon: Snowflake, key: "nav.icebreakers" },
  { href: "/dashboard/audience", icon: Users, key: "nav.audience" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "nav.analytics" },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  username?: string
  profilePic?: string | null
  className?: string
  onLogout?: () => void
  onNavigate?: () => void
}

export function Sidebar({ className, username = "creator", profilePic, onLogout, onNavigate, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { lang, setLang, t } = useLang()

  return (
    <aside className={cn("flex flex-col bg-sidebar text-sidebar-foreground", className)} {...props}>
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-yellow rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-accent-yellow-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">insta-p8</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_KEYS.map(({ href, icon: Icon, key }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                active
                  ? "text-accent-yellow-foreground bg-accent-yellow font-medium shadow-sm"
                  : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2 : 1.7} />
              <span>{t(key)}</span>
            </Link>
          )
        })}

        <div className="py-3 px-3">
          <div className="h-px bg-sidebar-border" />
        </div>

        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          aria-current={pathname === "/dashboard/settings" ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
            pathname === "/dashboard/settings"
              ? "text-accent-yellow-foreground bg-accent-yellow font-medium shadow-sm"
              : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.7} />
          <span>{t("nav.settings")}</span>
        </Link>

        <a
          href="https://t.me/instagramautomationp8"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
        >
          <Send className="w-[18px] h-[18px] shrink-0" strokeWidth={1.7} />
          <span>{t("nav.help")}</span>
        </a>
      </nav>

      <div className="px-3 pb-2">
        <LanguageSwitcher lang={lang} onChange={setLang} />
      </div>

      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sidebar-accent/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1.5px] shrink-0">
            <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt={username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-[11px] font-semibold text-sidebar-foreground">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-sidebar-foreground truncate">@{username}</p>
          </div>
          <button
            onClick={onLogout}
            title={t("common.logout")}
            aria-label={t("common.logout")}
            className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
