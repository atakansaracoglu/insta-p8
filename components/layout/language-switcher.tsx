"use client"

import { useState, useRef, useEffect } from "react"
import { LANGUAGES, type LangCode } from "@/lib/i18n"
import { Globe } from "lucide-react"

export function LanguageSwitcher({ lang, onChange }: { lang: LangCode; onChange: (code: LangCode) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.flag} {current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { onChange(l.code); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                l.code === lang ? "bg-accent-yellow/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="text-sm">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
