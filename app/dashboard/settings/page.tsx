"use client"

import { Settings } from "lucide-react"
import { useLang } from "@/components/lang-provider"

export default function SettingsPage() {
    const { t } = useLang()

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">{t("settings.systemSettings")}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                {t("settings.description")}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
                {t("common.comingSoon")}
            </div>
        </div>
    )
}
