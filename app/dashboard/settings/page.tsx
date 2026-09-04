"use client"

import { Settings } from "lucide-react"
import { useLang } from "@/components/lang-provider"

export default function SettingsPage() {
    const { t } = useLang()

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif-display text-4xl text-foreground mb-2">{t("settings.systemSettings")}</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                {t("settings.description")}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest border border-border">
                {t("common.comingSoon")}
            </div>
        </div>
    )
}
