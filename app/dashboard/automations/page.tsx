"use client"

import { useState, useCallback, useEffect } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { AutomationList } from "@/components/dashboard/AutomationList"
import { CreateRuleForm } from "@/components/dashboard/CreateRuleForm"
import { MessageCircle, Send, Sparkles, Plus, Brain, Loader2 } from "lucide-react"
import type { Automation } from "@/lib/types"
import { useLang } from "@/components/lang-provider"

export default function AutomationsPage() {
    const { userId, isLoading: isSessionLoading } = useInstagramSession()
    const [automations, setAutomations] = useState<Automation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'comment' | 'dm' | 'story'>('comment')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editRule, setEditRule] = useState<Automation | null>(null)
    const [aiEnabled, setAiEnabled] = useState(false)
    const [aiLoading, setAiLoading] = useState(true)
    const [aiToggling, setAiToggling] = useState(false)
    const [showAiContext, setShowAiContext] = useState(false)
    const [aiContext, setAiContext] = useState("")
    const [aiContextSaving, setAiContextSaving] = useState(false)
    const [aiContextSaved, setAiContextSaved] = useState(false)
    const [groqApiKey, setGroqApiKey] = useState("")
    const [hasApiKey, setHasApiKey] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [aiBaseUrl, setAiBaseUrl] = useState("")
    const [aiModel, setAiModel] = useState("")
    const { t } = useLang()

    useEffect(() => {
        if (!userId) return
        fetch(`/api/groq/auto-reply?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                setAiEnabled(data.enabled ?? false)
                setAiContext(data.ai_context ?? "")
                setHasApiKey(data.has_api_key ?? false)
                setAiBaseUrl(data.ai_base_url ?? "")
                setAiModel(data.ai_model ?? "")
            })
            .catch(() => {})
            .finally(() => setAiLoading(false))
    }, [userId])

    const handleSaveAiContext = async () => {
        if (aiContextSaving) return
        setAiContextSaving(true)
        try {
            await fetch("/api/groq/auto-reply", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    enabled: aiEnabled,
                    ai_context: aiContext,
                    ai_base_url: aiBaseUrl,
                    ai_model: aiModel,
                    ...(groqApiKey !== "" ? { groq_api_key: groqApiKey } : {}),
                }),
            })
            if (groqApiKey) { setHasApiKey(true); setGroqApiKey(""); setShowApiKey(false) }
            setAiContextSaved(true)
            setTimeout(() => setAiContextSaved(false), 2000)
        } catch {}
        setAiContextSaving(false)
    }

    const handleToggleAI = async () => {
        if (aiToggling) return
        setAiToggling(true)
        const newState = !aiEnabled
        try {
            const res = await fetch("/api/groq/auto-reply", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, enabled: newState }),
            })
            if (res.ok) setAiEnabled(newState)
        } catch {}
        setAiToggling(false)
    }

    const fetchAutomations = useCallback(async () => {
        if (!userId) return
        try {
            const res = await fetch(`/api/automations?userId=${userId}`)
            const data = await res.json()
            if (res.ok) setAutomations(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Fetch error:", err)
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (userId) fetchAutomations()
    }, [userId, fetchAutomations])

    const handleDeleteRule = async (id: string) => {
        await fetch(`/api/automations?id=${id}`, { method: "DELETE" })
        fetchAutomations()
    }

    const handleEditRule = (rule: Automation) => {
        setEditRule(rule)
        setShowCreateForm(true)
    }

    if (isSessionLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
        )
    }
    if (!userId) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-muted-foreground">
                {t("auto.pleaseLogin")}
            </div>
        )
    }

    const filteredAutomations = automations.filter(a => a.trigger_source === activeTab)
    const counts = {
        comment: automations.filter(a => a.trigger_source === 'comment').length,
        dm: automations.filter(a => a.trigger_source === 'dm').length,
        story: automations.filter(a => a.trigger_source === 'story').length,
    }

    const tabs = [
        { key: 'comment' as const, icon: <MessageCircle className="w-4 h-4" />, label: t("auto.comments"), count: counts.comment },
        { key: 'dm' as const, icon: <Send className="w-4 h-4" />, label: t("auto.dms"), count: counts.dm },
        { key: 'story' as const, icon: <Sparkles className="w-4 h-4" />, label: t("auto.stories"), count: counts.story },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("auto.title")}</h1>
                        <p className="text-muted-foreground text-sm mt-1">{t("auto.rulesEngine")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {aiLoading ? (
                            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowAiContext(!showAiContext)}
                                    aria-expanded={showAiContext}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    title={t("auto.aiSettings")}
                                    aria-label={t("auto.aiSettings")}
                                >
                                    <Brain className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleToggleAI}
                                    disabled={aiToggling}
                                    aria-pressed={aiEnabled}
                                    className={`flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-all ${
                                        aiEnabled
                                            ? 'bg-accent-yellow text-accent-yellow-foreground shadow-sm'
                                            : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-accent'
                                    }`}
                                >
                                    <Sparkles className={`w-3.5 h-3.5 ${aiToggling ? 'animate-pulse' : ''}`} />
                                    {aiToggling ? '...' : aiEnabled ? 'AI ON' : 'AI OFF'}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => {
                                if (showCreateForm) setEditRule(null)
                                setShowCreateForm(!showCreateForm)
                            }}
                            aria-expanded={showCreateForm}
                            className={`flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-all ${
                                showCreateForm
                                    ? 'bg-card text-foreground border border-border hover:bg-accent'
                                    : 'bg-accent-yellow text-accent-yellow-foreground hover:opacity-90 shadow-sm'
                            }`}
                        >
                            <Plus className={`w-4 h-4 transition-transform duration-200 ${showCreateForm ? 'rotate-45' : ''}`} />
                            {showCreateForm ? t("auto.close") : t("auto.newRule")}
                        </button>
                    </div>
                </div>

                {/* AI Context Panel */}
                {showAiContext && (
                    <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-accent-yellow" />
                            <span className="text-sm font-medium text-foreground">{t("auto.aiSettings")}</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-muted-foreground font-medium">{t("auto.apiKey")}</label>
                                {hasApiKey && !showApiKey && <span className="text-[10px] text-success font-mono">{t("auto.keySaved")}</span>}
                            </div>
                            {showApiKey || !hasApiKey ? (
                                <div className="flex gap-2">
                                    <input type="password" value={groqApiKey} onChange={e => setGroqApiKey(e.target.value)} placeholder={hasApiKey ? t("auto.enterNewKey") : "sk_… or gsk_…"} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-yellow/30 font-mono" />
                                    {hasApiKey && <button onClick={() => setShowApiKey(false)} className="px-3 py-2 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground transition-colors">{t("common.cancel")}</button>}
                                </div>
                            ) : (
                                <button onClick={() => setShowApiKey(true)} className="w-full text-left px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:border-foreground/20 transition-colors">
                                    •••••••••••••••••••• <span className="text-xs ml-2">{t("auto.clickToReplace")}</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">{t("auto.apiBaseUrl")} <span className="text-muted-foreground/60">({t("auto.optional")})</span></label>
                            <input type="text" value={aiBaseUrl} onChange={e => setAiBaseUrl(e.target.value)} placeholder="https://api.groq.com/v1" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-yellow/30 font-mono" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">{t("auto.model")} <span className="text-muted-foreground/60">({t("auto.optional")})</span></label>
                            <input type="text" value={aiModel} onChange={e => setAiModel(e.target.value)} placeholder="llama-3.1-8b-instant" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-yellow/30 font-mono" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">{t("auto.aiContext")}</label>
                            <p className="text-[11px] text-muted-foreground">{t("auto.aiContextHint")}</p>
                            <textarea value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder="e.g. This is a fitness coaching account..." rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent-yellow/30" />
                        </div>

                        <button onClick={handleSaveAiContext} disabled={aiContextSaving} className="px-4 py-2 rounded-lg bg-accent-yellow text-accent-yellow-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">
                            {aiContextSaving ? t("common.saving") : aiContextSaved ? t("common.saved") : t("common.save")}
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5 w-fit">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                                    isActive
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                        isActive ? 'bg-accent-yellow text-accent-yellow-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {showCreateForm && (
                    <div className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <CreateRuleForm
                            userId={userId}
                            triggerSource={editRule ? editRule.trigger_source : activeTab}
                            editRule={editRule}
                            onSuccess={() => {
                                fetchAutomations()
                                setShowCreateForm(false)
                                setEditRule(null)
                            }}
                        />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <AutomationList
                        automations={filteredAutomations}
                        onDelete={handleDeleteRule}
                        onEdit={handleEditRule}
                        onChanged={fetchAutomations}
                        userId={userId}
                    />
                )}
            </div>
        </div>
    )
}
