"use client"

import { useEffect, useState, useMemo } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import {
  Users, MessageCircle, Send, Loader2, Search, Download, Tag, Filter,
  Plus, X, Check, Megaphone, ChevronDown,
} from "lucide-react"
import { useLang } from "@/components/lang-provider"
import { toast } from "sonner"

interface AudienceMember {
  id: string
  recipient_id: string
  recipient_username: string
  last_message_at: string
  created_at: string
  message_count: number
  bot_messages: number
  tags?: string[]
}

type SegmentFilter = "all" | "active7d" | "active30d" | "high_engagement" | "new"

export default function AudiencePage() {
  const { userId, isLoading: sessionLoading } = useInstagramSession()
  const [audience, setAudience] = useState<AudienceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [segment, setSegment] = useState<SegmentFilter>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState("")
  const [sending, setSending] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showTagInput, setShowTagInput] = useState<string | null>(null)
  const [dmTarget, setDmTarget] = useState<AudienceMember | null>(null)
  const [dmText, setDmText] = useState("")
  const [dmSending, setDmSending] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    if (!userId) return
    fetch(`/api/audience?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAudience(data.map((a: AudienceMember) => ({ ...a, tags: a.tags || [] })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const now = Date.now()
  const filtered = useMemo(() => {
    let list = audience
    if (search) list = list.filter((a) => a.recipient_username.toLowerCase().includes(search.toLowerCase()))
    switch (segment) {
      case "active7d": list = list.filter(a => now - new Date(a.last_message_at).getTime() < 7 * 86400000); break
      case "active30d": list = list.filter(a => now - new Date(a.last_message_at).getTime() < 30 * 86400000); break
      case "high_engagement": list = list.filter(a => a.message_count >= 5); break
      case "new": list = list.filter(a => now - new Date(a.created_at).getTime() < 7 * 86400000); break
    }
    return list
  }, [audience, search, segment, now])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(a => a.recipient_id)))
  }

  const exportCSV = () => {
    const rows = [["Username", "Messages", "Bot Replies", "First Contact", "Last Active", "Tags"].join(",")]
    for (const a of filtered) {
      rows.push([
        `@${a.recipient_username}`,
        a.message_count,
        a.bot_messages,
        new Date(a.created_at).toLocaleDateString(),
        new Date(a.last_message_at).toLocaleDateString(),
        (a.tags || []).join(";"),
      ].join(","))
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audience-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("audience.exported"))
  }

  const addTag = (memberId: string, tag: string) => {
    if (!tag.trim()) return
    setAudience(prev => prev.map(a =>
      a.recipient_id === memberId && !(a.tags || []).includes(tag.trim())
        ? { ...a, tags: [...(a.tags || []), tag.trim()] }
        : a
    ))
    setTagInput("")
    setShowTagInput(null)
    // ponytail: tags are client-side only for now; persist to DB when needed
  }

  const removeTag = (memberId: string, tag: string) => {
    setAudience(prev => prev.map(a =>
      a.recipient_id === memberId
        ? { ...a, tags: (a.tags || []).filter(t => t !== tag) }
        : a
    ))
  }

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim() || !userId) return
    const targets = selected.size > 0 ? Array.from(selected) : filtered.map(a => a.recipient_id)
    if (targets.length === 0) return toast.error(t("audience.noTargets"))
    setSending(true)
    try {
      const res = await fetch("/api/audience/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, recipientIds: targets, message: broadcastMsg }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t("audience.broadcastSent").replace("{count}", data.sent?.toString() || targets.length.toString()))
        setBroadcastMsg("")
        setShowBroadcast(false)
        setSelected(new Set())
      } else {
        toast.error(data.error || t("audience.broadcastFailed"))
      }
    } catch {
      toast.error(t("audience.broadcastFailed"))
    } finally {
      setSending(false)
    }
  }

  const sendDM = async () => {
    if (!dmText.trim() || !dmTarget || !userId) return
    setDmSending(true)
    try {
      const res = await fetch("/api/audience/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, recipientId: dmTarget.recipient_id, message: dmText }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t("audience.dmSent"))
        setDmText("")
        setDmTarget(null)
      } else {
        toast.error(data.error || t("audience.dmFailed"))
      }
    } catch {
      toast.error(t("audience.dmFailed"))
    } finally {
      setDmSending(false)
    }
  }

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    )
  }

  const segments: { key: SegmentFilter; label: string }[] = [
    { key: "all", label: t("audience.segAll") },
    { key: "active7d", label: t("audience.seg7d") },
    { key: "active30d", label: t("audience.seg30d") },
    { key: "high_engagement", label: t("audience.segEngaged") },
    { key: "new", label: t("audience.segNew") },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("audience.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("audience.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-card hover:bg-accent text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" /> {t("audience.export")}
          </button>
          <button
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent-yellow text-accent-yellow-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Megaphone className="w-3.5 h-3.5" /> {t("audience.broadcast")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, value: audience.length, label: t("audience.totalContacts") },
          { icon: MessageCircle, value: audience.reduce((s, a) => s + a.message_count, 0), label: t("audience.totalMessages") },
          { icon: Send, value: audience.reduce((s, a) => s + a.bot_messages, 0), label: t("audience.botMessages") },
          { icon: Filter, value: filtered.length, label: t("audience.filtered") },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
            <s.icon className="w-4 h-4 text-accent-yellow mb-2" strokeWidth={1.8} />
            <p className="text-2xl font-semibold tracking-tight text-foreground">{s.value.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Broadcast Panel */}
      {showBroadcast && (
        <div className="rounded-xl border border-accent-yellow/30 bg-accent-yellow/5 p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-accent-yellow" />
            <span className="text-sm font-medium text-foreground">{t("audience.broadcastTitle")}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {selected.size > 0 ? t("audience.selectedCount").replace("{count}", selected.size.toString()) : t("audience.allFiltered").replace("{count}", filtered.length.toString())}
            </span>
          </div>
          <textarea
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder={t("audience.broadcastPlaceholder")}
            rows={3}
            maxLength={1000}
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent-yellow/30"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{broadcastMsg.length}/1000</span>
            <div className="flex gap-2">
              <button onClick={() => setShowBroadcast(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">
                {t("common.cancel")}
              </button>
              <button onClick={sendBroadcast} disabled={sending || !broadcastMsg.trim()} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-accent-yellow text-accent-yellow-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : t("audience.sendBroadcast")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DM Panel */}
      {dmTarget && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-accent-yellow" />
            <span className="text-sm font-medium text-foreground">{t("audience.dmTo")} @{dmTarget.recipient_username}</span>
            <button onClick={() => setDmTarget(null)} className="ml-auto p-1 rounded hover:bg-accent text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
          <textarea
            value={dmText}
            onChange={(e) => setDmText(e.target.value)}
            placeholder={t("audience.dmPlaceholder")}
            rows={2}
            maxLength={1000}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent-yellow/30"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setDmTarget(null)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">
              {t("common.cancel")}
            </button>
            <button onClick={sendDM} disabled={dmSending || !dmText.trim()} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-accent-yellow text-accent-yellow-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
              {dmSending ? <Loader2 className="w-3 h-3 animate-spin" /> : t("audience.sendDm")}
            </button>
          </div>
        </div>
      )}

      {/* Segments + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          {segments.map(s => (
            <button
              key={s.key}
              onClick={() => setSegment(s.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                segment === s.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("audience.search")}
            className="w-full h-9 pl-9 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-yellow/30"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {audience.length === 0 ? t("audience.noContacts") : t("audience.noMatch")}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="rounded border-border accent-accent-yellow"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">{t("audience.username")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("audience.tags")}</th>
                  <th className="text-center px-4 py-3 font-medium">{t("audience.messages")}</th>
                  <th className="text-center px-4 py-3 font-medium">{t("audience.botReplies")}</th>
                  <th className="text-right px-4 py-3 font-medium">{t("audience.lastActive")}</th>
                  <th className="text-right px-4 py-3 font-medium w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-accent/40 transition-colors group">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(a.recipient_id)}
                        onChange={() => toggleSelect(a.recipient_id)}
                        className="rounded border-border accent-accent-yellow"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">@{a.recipient_username}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(a.tags || []).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-accent-yellow/10 text-accent-yellow text-[10px] font-medium">
                            {tag}
                            <button onClick={() => removeTag(a.recipient_id, tag)} className="hover:text-destructive ml-0.5"><X className="w-2.5 h-2.5" /></button>
                          </span>
                        ))}
                        {showTagInput === a.recipient_id ? (
                          <div className="flex items-center gap-1">
                            <input
                              value={tagInput}
                              onChange={e => setTagInput(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && addTag(a.recipient_id, tagInput)}
                              placeholder={t("audience.tagPlaceholder")}
                              className="w-20 h-5 px-1.5 rounded text-[10px] bg-background border border-border focus:outline-none"
                              autoFocus
                            />
                            <button onClick={() => addTag(a.recipient_id, tagInput)} className="text-accent-yellow"><Check className="w-3 h-3" /></button>
                            <button onClick={() => { setShowTagInput(null); setTagInput("") }} className="text-muted-foreground"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setShowTagInput(a.recipient_id)} className="p-0.5 rounded hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{a.message_count}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{a.bot_messages}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {new Date(a.last_message_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDmTarget(a)}
                        title={t("audience.sendDm")}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-accent-yellow hover:bg-accent-yellow/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
