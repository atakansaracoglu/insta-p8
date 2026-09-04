"use client"

import { useEffect, useState } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Users, MessageCircle, Send, Loader2, Search } from "lucide-react"

interface AudienceMember {
  id: string
  recipient_id: string
  recipient_username: string
  last_message_at: string
  created_at: string
  message_count: number
  bot_messages: number
}

export default function AudiencePage() {
  const { userId, isLoading: sessionLoading } = useInstagramSession()
  const [audience, setAudience] = useState<AudienceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!userId) return
    fetch(`/api/audience?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAudience(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const filtered = search
    ? audience.filter((a) => a.recipient_username.toLowerCase().includes(search.toLowerCase()))
    : audience

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700">
      <div>
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Audience</p>
        <h1 className="font-serif-display text-4xl text-foreground">Your contacts</h1>
        <p className="text-muted-foreground text-sm mt-2">People who interacted with your automations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card">
          <Users className="w-5 h-5 text-accent-yellow-foreground dark:text-accent-yellow mb-3" />
          <p className="font-serif-display text-3xl text-foreground">{audience.length}</p>
          <p className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total contacts</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-card">
          <MessageCircle className="w-5 h-5 text-accent-yellow-foreground dark:text-accent-yellow mb-3" />
          <p className="font-serif-display text-3xl text-foreground">{audience.reduce((s, a) => s + a.message_count, 0)}</p>
          <p className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total messages</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-card">
          <Send className="w-5 h-5 text-accent-yellow-foreground dark:text-accent-yellow mb-3" />
          <p className="font-serif-display text-3xl text-foreground">{audience.reduce((s, a) => s + a.bot_messages, 0)}</p>
          <p className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Bot messages sent</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {audience.length === 0 ? "No contacts yet — they'll appear after your first automation runs." : "No matching contacts."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-mono-ui uppercase tracking-widest">
                <th className="text-left px-4 py-3">Username</th>
                <th className="text-center px-4 py-3">Messages</th>
                <th className="text-center px-4 py-3">Bot replies</th>
                <th className="text-right px-4 py-3">First contact</th>
                <th className="text-right px-4 py-3">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">@{a.recipient_username}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{a.message_count}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{a.bot_messages}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {new Date(a.last_message_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
