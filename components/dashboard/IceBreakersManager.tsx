"use client"

import { useState, useEffect } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useLang } from "@/components/lang-provider"

type IceBreakerRow = { id?: string; question: string; response: string }

export function IceBreakersManager() {
    const { userId, isLoading } = useInstagramSession()
    const [breakers, setBreakers] = useState<IceBreakerRow[]>([])
    const [saving, setSaving] = useState(false)
    const [fetching, setFetching] = useState(true)
    const { t } = useLang()

    useEffect(() => {
        if (!userId) return
        fetch(`/api/ice-breakers?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setBreakers(data)
                setFetching(false)
            })
            .catch(err => {
                console.error(err)
                setFetching(false)
            })
    }, [userId])

    const handleAdd = () => {
        if (breakers.length >= 4) {
            toast.error(t("icebreakers.maxError"))
            return
        }
        setBreakers([...breakers, { question: "", response: "" }])
    }

    const handleChange = (index: number, field: "question" | "response", value: string) => {
        const newBreakers = [...breakers]
        newBreakers[index] = { ...newBreakers[index], [field]: value }
        setBreakers(newBreakers)
    }

    const handleRemove = (index: number) => {
        setBreakers(breakers.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!userId) return

        if (breakers.some(b => !b.question?.trim() || !b.response?.trim())) {
            toast.error(t("icebreakers.fillError"))
            return
        }

        setSaving(true)
        try {
            const res = await fetch("/api/ice-breakers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, iceBreakers: breakers })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(t("icebreakers.saved"))
            } else {
                toast.error(t("icebreakers.saveFailed"))
            }
        } catch (e) {
            toast.error(t("icebreakers.saveError"))
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) {
            return (
                <div className="p-10 flex justify-center">
                    <Loader2 className="animate-spin text-accent-yellow-foreground dark:text-accent-yellow" />
                </div>
            )
        }

        if (!userId) {
            return (
                <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground bg-card/40">
                        <p className="text-sm font-medium">{t("icebreakers.notConnected")}</p>
                        <p className="text-xs mt-1">{t("icebreakers.connectPrompt")}</p>
                    </div>
                </div>
            )
        }

        if (fetching && !breakers.length) {
            return (
                <div className="p-10 flex justify-center">
                    <Loader2 className="animate-spin text-accent-yellow-foreground dark:text-accent-yellow" />
                </div>
            )
        }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif-display text-3xl text-foreground">{t("icebreakers.title")}</h2>
                    <p className="text-muted-foreground text-sm">
                        {t("icebreakers.subtitle")}
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:opacity-90 font-bold"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {t("icebreakers.saveSync")}
                </Button>
            </div>

            <div className="space-y-4">
                {breakers.map((item, idx) => (
                    <div key={idx} className="bg-card border border-border p-4 rounded-xl space-y-3 relative group">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">{t("icebreakers.question")}</label>
                                    <Input
                                        value={item.question}
                                        onChange={e => handleChange(idx, "question", e.target.value)}
                                        placeholder={t("icebreakers.questionPlaceholder")}
                                        className="bg-background border-input mt-1 focus-visible:ring-ring"
                                        maxLength={80}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">{t("icebreakers.autoResponse")}</label>
                                    <Textarea
                                        value={item.response}
                                        onChange={e => handleChange(idx, "response", e.target.value)}
                                        placeholder={t("icebreakers.responsePlaceholder")}
                                        className="bg-background border-input mt-1 focus-visible:ring-ring"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(idx)}
                                aria-label={t("auto.delete")}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {breakers.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground bg-card/40">
                        {t("icebreakers.empty")}
                    </div>
                )}

                {breakers.length < 4 && (
                    <Button
                        variant="outline"
                        onClick={handleAdd}
                        className="w-full border-dashed border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {t("icebreakers.addQuestion")}
                    </Button>
                )}
            </div>

            <div className="bg-muted border border-border p-4 rounded-xl flex gap-3 text-sm text-foreground">
                <RefreshCw className="w-5 h-5 shrink-0 text-muted-foreground" />
                <p>
                    {t("icebreakers.syncNote")}
                </p>
            </div>
        </div>
    )
}
