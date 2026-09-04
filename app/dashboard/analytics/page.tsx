"use client"

import { useEffect, useState } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Loader2, TrendingUp, Users, Send, Zap, BarChart3 } from "lucide-react"
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
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <BarChart3 className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Could not load analytics.</p>
      </div>
    )
  }

  const chartData = data.messagesPerDay.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }))

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700">
      <div>
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Analytics</p>
        <h1 className="font-serif-display text-4xl text-foreground">Performance</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Zap, value: data.totals.triggers, label: "Total triggers" },
          { icon: Send, value: data.totals.botMessages, label: "Bot messages" },
          { icon: TrendingUp, value: data.totals.received, label: "Received" },
          { icon: Users, value: data.totals.contacts, label: "Contacts" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl border border-border bg-card">
            <s.icon className="w-5 h-5 text-accent-yellow-foreground dark:text-accent-yellow mb-3" />
            <p className="font-serif-display text-3xl text-foreground">{s.value}</p>
            <p className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Messages over time */}
      {chartData.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Messages over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent-yellow))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent-yellow))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="sent" name="Sent" stroke="hsl(var(--accent-yellow))" fill="url(#sent)" strokeWidth={2} />
                <Area type="monotone" dataKey="received" name="Received" stroke="hsl(var(--muted-foreground))" fill="url(#recv)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top automations */}
      {data.topAutomations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Top automations by triggers</p>
          {data.topAutomations.some((a) => a.trigger_count > 0) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topAutomations.filter((a) => a.trigger_count > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="trigger_count" name="Triggers" fill="hsl(var(--accent-yellow))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No triggers recorded yet.</p>
          )}
        </div>
      )}

      {chartData.length <= 1 && data.topAutomations.every((a) => !a.trigger_count) && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Not enough data yet. Charts will appear after your automations run.</p>
        </div>
      )}
    </div>
  )
}
