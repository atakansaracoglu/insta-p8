"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getLang, setLang as persistLang, t as translate, type LangCode } from "@/lib/i18n"

interface LangCtx {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: (key: string) => string
}

const Ctx = createContext<LangCtx>({ lang: "tr", setLang: () => {}, t: (k) => k })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, _setLang] = useState<LangCode>("tr")

  useEffect(() => { _setLang(getLang()) }, [])

  const setLang = useCallback((code: LangCode) => {
    persistLang(code)
    _setLang(code)
  }, [])

  const t = useCallback((key: string) => translate(key, lang), [lang])

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useLang() {
  return useContext(Ctx)
}
