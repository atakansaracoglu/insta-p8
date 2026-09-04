"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Activity, Users, MessageCircle, Zap, Loader2, ArrowUpRight } from "lucide-react"
import { useLang } from "@/components/lang-provider"
import Link from "next/link"

interface DashboardStats {
    metrics: {
        totalAutomations: number
        activeTriggers: number
        audienceReached: number
        messagesSent: number
    }
    recentActivity: Array<{
        id: string
        content: string
        created_at: string
        recipient?: {
            recipient_username: string
        }
    }>
}

export default function DashboardPage() {
    const { username, userId, isLoading: isSessionLoading } = useInstagramSession()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const { t } = useLang()

    useEffect(() => {
        if (!userId) return
        fetch(`/api/dashboard/stats?userId=${userId}`)
            .then(res => res.json())
            .then(data => { if (data && !data.error) setStats(data) })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [userId])

    if (isSessionLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {t("dash.greeting").replace("{name}", username || "")}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">{t("dash.subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: t("dash.totalAutomations"), value: stats?.metrics.totalAutomations || 0, sub: t("dash.active"), icon: Zap },
                    { title: t("dash.messagesSent"), value: stats?.metrics.messagesSent || 0, sub: t("dash.lifetime"), icon: MessageCircle },
                    { title: t("dash.activeTriggers"), value: stats?.metrics.activeTriggers || 0, sub: t("dash.running"), icon: Activity },
                    { title: t("dash.audienceReached"), value: stats?.metrics.audienceReached || 0, sub: t("dash.uniqueUsers"), icon: Users },
                ].map((s) => (
                    <div key={s.title} className="p-5 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <s.icon className="w-5 h-5 text-accent-yellow" strokeWidth={1.8} />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.sub}</span>
                        </div>
                        <p className="text-3xl font-semibold tracking-tight text-foreground">{s.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-card border-border">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-foreground">{t("dash.recentActivity")}</h3>
                    </div>
                    <div className="space-y-1">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((msg) => (
                                <div key={msg.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/60 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-accent-yellow/10 flex items-center justify-center shrink-0">
                                        <MessageCircle className="w-4 h-4 text-accent-yellow" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-foreground truncate">
                                            {t("dash.autoReplyTo").replace("{name}", msg.recipient?.recipient_username || "user")}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-muted-foreground text-sm">
                                {t("dash.noActivity")}
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-foreground">{t("dash.quickActions")}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/automations" className="group p-5 rounded-xl border border-border hover:border-accent-yellow/40 hover:bg-accent-yellow/5 transition-all flex flex-col items-center justify-center gap-2">
                            <Zap className="w-6 h-6 text-muted-foreground group-hover:text-accent-yellow transition-colors" />
                            <span className="text-xs font-medium text-foreground">{t("dash.newRule")}</span>
                        </Link>
                        <Link href="/dashboard/audience" className="group p-5 rounded-xl border border-border hover:border-accent-yellow/40 hover:bg-accent-yellow/5 transition-all flex flex-col items-center justify-center gap-2">
                            <Users className="w-6 h-6 text-muted-foreground group-hover:text-accent-yellow transition-colors" />
                            <span className="text-xs font-medium text-foreground">{t("dash.viewAudience")}</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
