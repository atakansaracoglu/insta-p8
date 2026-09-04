"use client"

import { useEffect, useState } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Loader2, TrendingUp, Users, Send, Zap, BarChart3 } from "lucide-react"
import { useLang } from "@/components/lang-provider"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"

interface AnalyticsData {
  messagesPerDay: { date: string; sent: number; received: number }[]
  topAutomations: { id: string; name: string; trigger_count: number }[]
  totals: { contacts: number; botMessages: number; received: number; triggers: number }
}

export default function AnalyticsPage() {
  const { userId, isLoading: sessionLoading } = useInstagramSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    if (!userId) return
    fetch(`/api/analytics?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => { if (d.totals) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <BarChart3 className="w-8 h-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">{t("analytics.loadError")}</p>
      </div>
    )
  }

  const chartData = data.messagesPerDay.map((d) => ({ ...d, label: d.date.slice(5) }))

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("analytics.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("analytics.label")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Zap, value: data.totals.triggers, label: t("analytics.totalTriggers") },
          { icon: Send, value: data.totals.botMessages, label: t("analytics.botMessages") },
          { icon: TrendingUp, value: data.totals.received, label: t("analytics.received") },
          { icon: Users, value: data.totals.contacts, label: t("analytics.contacts") },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
            <s.icon className="w-4 h-4 text-accent-yellow mb-2" strokeWidth={1.8} />
            <p className="text-2xl font-semibold tracking-tight text-foreground">{s.value.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {chartData.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground mb-4">{t("analytics.messagesOverTime")}</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-yellow)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--accent-yellow)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="sent" name={t("analytics.sent")} stroke="var(--accent-yellow)" fill="url(#sent)" strokeWidth={2} />
                <Area type="monotone" dataKey="received" name={t("analytics.received")} stroke="var(--muted-foreground)" fill="url(#recv)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {data.topAutomations.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground mb-4">{t("analytics.topAutomations")}</p>
          {data.topAutomations.some((a) => a.trigger_count > 0) ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topAutomations.filter((a) => a.trigger_count > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="trigger_count" name={t("auto.triggers")} fill="var(--accent-yellow)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("analytics.noTriggers")}</p>
          )}
        </div>
      )}

      {chartData.length <= 1 && data.topAutomations.every((a) => !a.trigger_count) && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
        </div>
      )}
    </div>
  )
}
