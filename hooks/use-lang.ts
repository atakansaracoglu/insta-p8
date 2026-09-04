"use client"

import { useState, useEffect, useCallback } from "react"
import { getLang, setLang, t as translate, type LangCode } from "@/lib/i18n"

export function useLang() {
  const [lang, _setLang] = useState<LangCode>("tr")

  useEffect(() => {
    _setLang(getLang())
  }, [])

  const changeLang = useCallback((code: LangCode) => {
    setLang(code)
    _setLang(code)
  }, [])

  const t = useCallback((key: string) => translate(key, lang), [lang])

  return { lang, changeLang, t }
}
