"use client"

import { useState, useEffect } from "react"
import {
  Plus, Trash2, Film, Check, MessageCircle, AtSign, Heart,
  MessageSquare, Image as ImageIcon, Lock,
  Link2, Zap, ChevronRight, ChevronLeft, Loader2,
  Bell, FileText
} from "lucide-react"
import { TagInput } from "@/components/ui/tag-input"
import type { ProButton, Automation } from "@/lib/types"
import { useLang } from "@/components/lang-provider"
import { DEFAULT_OPT_IN, DEFAULT_GATE, type LangCode } from "@/lib/i18n"
import { toast } from "sonner"

interface CreateRuleFormProps {
  userId: string
  triggerSource: "comment" | "dm" | "story"
  onSuccess: () => void
  editRule?: Automation | null
}

export function CreateRuleForm({ userId, triggerSource, onSuccess, editRule }: CreateRuleFormProps) {
  const isEditing = !!editRule
  const [step, setStep] = useState(0)
  const { lang, t } = useLang()

  /* ---------- TRIGGER ---------- */
  const [triggers, setTriggers] = useState<string[]>([])
  const [storyTriggerType, setStoryTriggerType] = useState<"mention" | "reaction" | "reply">("mention")
  const [selectedReel, setSelectedReel] = useState<any | null>(null)
  const [hasSelectedReelOption, setHasSelectedReelOption] = useState<boolean>(false)
  const [keywordMode, setKeywordMode] = useState<"all" | "keyword">("all")
  const [exactMatch, setExactMatch] = useState(false)
  const [postTab, setPostTab] = useState<"all" | "selected">("all")

  /* ---------- RESPONSE ---------- */
  const [type, setType] = useState<"text" | "card" | "media">("text")
  const [messageText, setMessageText] = useState("")
  const [cardTitle, setCardTitle] = useState("")
  const [cardSubtitle, setCardSubtitle] = useState("")
  const [cardImage, setCardImage] = useState("")
  const [buttons, setButtons] = useState<ProButton[]>([])
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image")

  /* ---------- Public comment replies ---------- */
  const [publicReplies, setPublicReplies] = useState<string[]>([""])
  const [includeReplies, setIncludeReplies] = useState(false)
  const [replyMode, setReplyMode] = useState<"both" | "dm_only" | "public_only">("both")

  /* ---------- EXTRAS ---------- */
  const [name, setName] = useState("")
  const [checkFollow, setCheckFollow] = useState(false)
  const [followGateSubtitle, setFollowGateSubtitle] = useState("")
  const [followGateButton, setFollowGateButton] = useState("")
  const [followGateFollowButton, setFollowGateFollowButton] = useState("")
  const [optInMessage, setOptInMessage] = useState("")
  const [optInButton, setOptInButton] = useState("")
  const [delaySeconds, setDelaySeconds] = useState(0)
  const [typingIndicator, setTypingIndicator] = useState(false)
  const [linkReminder, setLinkReminder] = useState(false)
  const [extraMessage, setExtraMessage] = useState(false)
  const [contentButtonText, setContentButtonText] = useState("")
  const [contentButtonUrl, setContentButtonUrl] = useState("")

  const [saving, setSaving] = useState(false)
  const [reels, setReels] = useState<any[]>([])
  const [loadingReels, setLoadingReels] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoadingReels(true)
    fetch(`/api/instagram/media?userId=${userId}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        const list = j.data && Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : []
        setReels(list)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingReels(false))
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    if (!editRule) return
    const content: any =
      typeof editRule.response_content === "string"
        ? JSON.parse(editRule.response_content as any)
        : editRule.response_content || {}

    setName(editRule.name)
    if (["mention", "reaction", "reply"].includes(editRule.trigger_type)) {
      setStoryTriggerType(editRule.trigger_type as any)
    }
    const rawTriggers = (editRule.trigger_value || "")
      .split(",").map((t) => t.trim())
      .filter((t) => t && !["ALL", "ALL_COMMENTS", "ALL_MENTIONS", "ALL_REACTIONS"].includes(t.toUpperCase()))
    setTriggers(rawTriggers)
    setKeywordMode(rawTriggers.length > 0 ? "keyword" : "all")

    if (content.media?.url) {
      setType("media"); setMediaUrl(content.media.url); setMediaType(content.media.type || "image"); setMessageText(content.message || "")
    } else if (content.card) {
      setType("card"); setCardTitle(content.card.title || ""); setCardSubtitle(content.card.subtitle || ""); setCardImage(content.card.image_url || "")
      setButtons((content.card.buttons || []).map((b: any, i: number) => ({ id: `${Date.now()}_${i}`, ...b })))
    } else {
      setType("text"); setMessageText(content.message || "")
    }
    setReplyMode(content.reply_mode || "both")
    const pr = content.public_replies || []
    setPublicReplies(pr.length > 0 ? pr : [""])
    setIncludeReplies(content.include_replies === true)
    setCheckFollow(content.check_follow === true)
    setFollowGateSubtitle(content.follow_gate_subtitle || "")
    setFollowGateButton(content.follow_gate_button || "")
    setFollowGateFollowButton(content.follow_gate_follow_button || "")
    setOptInMessage(content.opt_in_message || "")
    setOptInButton(content.opt_in_button || "")
    setDelaySeconds(Number(content.delay_seconds) || 0)
    setTypingIndicator(content.typing_indicator === true)
    if (content.content_button_text) setContentButtonText(content.content_button_text)
    if (content.content_button_url) setContentButtonUrl(content.content_button_url)

    if (editRule.specific_media_id) {
      setSelectedReel({ id: editRule.specific_media_id, caption: "Selected post" })
      setHasSelectedReelOption(true)
      setPostTab("selected")
    } else {
      setHasSelectedReelOption(true)
      setPostTab("all")
    }
  }, [editRule])

  useEffect(() => {
    if (name || isEditing) return
    const isReplyAll = triggerSource === "comment" && keywordMode === "all"
    if (isReplyAll) setName("Reply to every comment")
    else if (triggers.length > 0) setName(`Reply to "${triggers[0]}"`)
  }, [triggers, name, isEditing, triggerSource, keywordMode])

  const addButton = () => {
    if (buttons.length >= 3) return
    setButtons([...buttons, { id: Date.now().toString(), type: "web_url", title: "", url: "", payload: "" }])
  }
  const updateButton = (id: string, field: keyof ProButton, value: string) =>
    setButtons(buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  const removeButton = (id: string) => setButtons(buttons.filter((b) => b.id !== id))

  const addPublicReply = () => {
    if (publicReplies.length >= 10) return
    setPublicReplies([...publicReplies, ""])
  }
  const updatePublicReply = (index: number, value: string) => {
    const next = [...publicReplies]
    next[index] = value
    setPublicReplies(next)
  }
  const removePublicReply = (index: number) => {
    setPublicReplies(publicReplies.filter((_, i) => i !== index))
  }

  const needsKeywords = triggerSource === "dm" || (triggerSource === "story" && storyTriggerType !== "mention")

  const whenValid = triggerSource === "comment"
    ? (postTab === "all" || (postTab === "selected" && selectedReel !== null))
    : !needsKeywords || triggers.length > 0

  const thenValid =
    replyMode === "public_only" ||
    (type === "text" ? messageText.trim().length > 0 || (checkFollow && optInMessage.trim().length > 0) : type === "card" ? cardTitle.trim().length > 0 : mediaUrl.trim().length > 0)

  const stepValid = [whenValid, thenValid, true]

  const handleSubmit = async () => {
    if (saving) return
    setSaving(true)

    const isReplyAll = triggerSource === "comment" && keywordMode === "all"

    const content: any = { check_follow: checkFollow, lang }
    if (checkFollow) {
      if (followGateSubtitle.trim()) content.follow_gate_subtitle = followGateSubtitle.trim()
      if (followGateButton.trim()) content.follow_gate_button = followGateButton.trim()
      if (followGateFollowButton.trim()) content.follow_gate_follow_button = followGateFollowButton.trim()
      if (optInMessage.trim()) content.opt_in_message = optInMessage.trim()
      if (optInButton.trim()) content.opt_in_button = optInButton.trim()
    }
    if (delaySeconds > 0) content.delay_seconds = delaySeconds
    if (typingIndicator) content.typing_indicator = true
    if (triggerSource === "comment") {
      content.reply_mode = replyMode
      const pr = publicReplies.map((s) => s.trim()).filter(Boolean)
      if (pr.length > 0) content.public_replies = pr
      if (includeReplies) content.include_replies = true
    }
    if (contentButtonText.trim()) content.content_button_text = contentButtonText.trim()
    if (contentButtonUrl.trim()) content.content_button_url = contentButtonUrl.trim()
    if (exactMatch) content.exact_match = true

    if (type === "text") {
      content.message = messageText
    } else if (type === "media") {
      content.media = { type: mediaType, url: mediaUrl.trim() }
      if (messageText.trim()) content.message = messageText
    } else {
      const cleanButtons = buttons
        .map((b) => {
          if (b.type === "web_url") {
            let cleanUrl = b.url?.trim() || ""
            if (cleanUrl.startsWith("https://https://")) cleanUrl = cleanUrl.replace("https://https://", "https://")
            return { type: "web_url" as const, title: b.title, url: cleanUrl }
          }
          return { type: "postback" as const, title: b.title, payload: b.payload }
        })
        .filter((b) => b.title)
      content.card = { title: cardTitle, subtitle: cardSubtitle || undefined, image_url: cardImage || undefined, buttons: cleanButtons }
    }

    const payload = {
      userId,
      name: name || `Rule ${Date.now()}`,
      trigger_source: triggerSource,
      trigger_type: isReplyAll ? "reply_all" : triggerSource === "story" ? storyTriggerType : "keyword",
      trigger_value: isReplyAll ? "ALL_COMMENTS"
        : triggerSource === "story" && storyTriggerType === "mention" ? "ALL_MENTIONS"
          : triggerSource === "story" && storyTriggerType === "reaction" && triggers.length === 0 ? "ALL_REACTIONS"
            : triggers.length > 0 ? triggers.join(", ") : "ALL",
      content,
      specific_media_id: postTab === "selected" ? selectedReel?.id || null : null,
    }

    try {
      const res = await fetch("/api/automations", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { ...payload, id: editRule!.id } : payload),
      })
      if (res.ok) {
        toast.success(isEditing ? "Automation updated" : "Automation is live")
        onSuccess()
      } else {
        toast.error("Could not save — try again")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  const TOTAL_STEPS = 3

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ── Step indicator ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono-ui">
            {t("wizard.stepOf").replace("{current}", String(step + 1)).replace("{total}", String(TOTAL_STEPS))}
          </p>
          <h2 className="text-xl font-bold text-foreground mt-1">
            {step === 0 ? t("wizard.step1Title") : step === 1 ? t("wizard.step2Title") : t("wizard.step3Title")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => { if (i < step || stepValid[step]) setStep(i) }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step
                  ? "bg-accent-yellow text-black"
                  : i === step
                    ? "bg-foreground text-background ring-4 ring-foreground/10"
                    : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {i < step ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-accent-yellow transition-all duration-500" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      {/* ═══════ STEP 1: TRIGGER ═══════ */}
      {step === 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
          <ToggleCard
            icon={<Lock className="w-5 h-5" />}
            title={t("wizard.subscriptionCheck")}
            description={t("wizard.subscriptionCheckDesc")}
            checked={checkFollow}
            onChange={() => setCheckFollow(!checkFollow)}
          />

          {triggerSource === "story" && (
            <div className="space-y-3">
              <SectionLabel>{t("form.triggerType")}</SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "mention" as const, icon: <AtSign className="w-5 h-5" />, label: "Mentions", desc: "Tagged in story" },
                  { key: "reaction" as const, icon: <Heart className="w-5 h-5" />, label: "Reacts", desc: "Emoji reaction" },
                  { key: "reply" as const, icon: <MessageSquare className="w-5 h-5" />, label: "Replies", desc: "Text reply" },
                ]).map(({ key, icon, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStoryTriggerType(key)}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                      storyTriggerType === key ? "border-accent-yellow bg-accent-yellow/10" : "border-border bg-muted/30 hover:border-foreground/30"
                    }`}
                  >
                    <span className={storyTriggerType === key ? "text-accent-yellow-foreground" : "text-muted-foreground"}>{icon}</span>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {triggerSource === "comment" && (
            <div className="space-y-3">
              <SectionLabel>{t("form.triggerType")}</SectionLabel>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="radio" name="keywordMode" checked={keywordMode === "all"} onChange={() => { setKeywordMode("all"); setTriggers([]) }} className="accent-[var(--accent-yellow)]" />
                  <span className="text-sm text-foreground">{t("wizard.anyComment")}</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="radio" name="keywordMode" checked={keywordMode === "keyword"} onChange={() => setKeywordMode("keyword")} className="accent-[var(--accent-yellow)]" />
                  <span className="text-sm text-foreground">{t("wizard.keywordComment")}</span>
                </label>
              </div>
            </div>
          )}

          {((keywordMode === "keyword" && triggerSource === "comment") || (triggerSource !== "comment" && needsKeywords)) && (
            <div className="space-y-3">
              <SectionLabel>{t("form.keyword")}</SectionLabel>
              <TagInput
                value={triggers}
                onChange={setTriggers}
                placeholder={triggerSource === "story" && storyTriggerType === "reaction" ? "e.g. ❤️, 🔥, 👍" : "type keyword, press Enter"}
              />
              {triggerSource === "comment" && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={exactMatch} onChange={() => setExactMatch(!exactMatch)} className="accent-[var(--accent-yellow)]" />
                  {t("wizard.exactMatch")}
                </label>
              )}
            </div>
          )}

          {triggerSource === "dm" && (
            <div className="space-y-3">
              <SectionLabel>{t("form.keyword")}</SectionLabel>
              <TagInput value={triggers} onChange={setTriggers} placeholder="type keyword, press Enter (e.g. price)" />
            </div>
          )}

          {triggerSource === "comment" && (
            <div className="space-y-3">
              <div className="flex border-b border-border">
                <button type="button" onClick={() => { setPostTab("all"); setSelectedReel(null); setHasSelectedReelOption(true) }}
                  className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${postTab === "all" ? "border-accent-yellow text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {t("wizard.allPosts")}
                </button>
                <button type="button" onClick={() => { setPostTab("selected"); setHasSelectedReelOption(false) }}
                  className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${postTab === "selected" ? "border-accent-yellow text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {t("wizard.selectedPosts")}
                </button>
              </div>

              {postTab === "selected" && (
                loadingReels ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 border border-border rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-yellow-foreground" />
                    <span className="text-xs text-muted-foreground">Fetching Instagram feed...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[350px] overflow-y-auto pr-1">
                    {reels.map((reel) => {
                      const isSelected = selectedReel?.id === reel.id
                      return (
                        <button key={reel.id} type="button" onClick={() => { setSelectedReel(reel); setHasSelectedReelOption(true) }}
                          className={`aspect-square rounded-xl border overflow-hidden relative group bg-neutral-900 transition-all ${isSelected ? "border-accent-yellow ring-2 ring-accent-yellow/30" : "border-border hover:border-foreground/40"}`}>
                          {reel.image_url ? (
                            <img src={reel.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Film className="w-6 h-6 text-neutral-500" /></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-mono-ui text-white uppercase tracking-wider border border-white/10">
                            {reel.media_type === "VIDEO" ? "Reel" : "Post"}
                          </span>
                          {isSelected && (
                            <div className="absolute inset-0 bg-accent-yellow/20 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-accent-yellow text-black flex items-center justify-center"><Check className="w-4 h-4 stroke-[3]" /></div>
                            </div>
                          )}
                          <p className="absolute bottom-1 inset-x-1 text-[9px] text-white line-clamp-1 pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{reel.caption || "Untitled"}</p>
                        </button>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {triggerSource === "comment" && keywordMode === "keyword" && triggers.length > 0 && (
            <ToggleCard
              icon={<MessageSquare className="w-5 h-5" />}
              title="Check replies to comments"
              description="Normally only primary post comments trigger replies"
              checked={includeReplies}
              onChange={() => setIncludeReplies(!includeReplies)}
            />
          )}
        </div>
      )}

      {/* ═══════ STEP 2: MESSAGE SETTINGS ═══════ */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
            <SectionLabel>{t("wizard.welcomeMessage")}</SectionLabel>
            <textarea
              value={checkFollow ? optInMessage : messageText}
              onChange={(e) => { if (checkFollow) setOptInMessage(e.target.value); else setMessageText(e.target.value) }}
              rows={3}
              maxLength={500}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-yellow/50 transition-colors"
              placeholder={checkFollow ? (DEFAULT_OPT_IN[lang] || DEFAULT_OPT_IN.tr).message : t("form.messagePlaceholder")}
            />
            <p className="text-[10px] text-muted-foreground font-mono-ui text-right">{(checkFollow ? optInMessage : messageText).length}/500</p>
            <input
              value={checkFollow ? optInButton : contentButtonText}
              onChange={(e) => { if (checkFollow) setOptInButton(e.target.value); else setContentButtonText(e.target.value) }}
              placeholder={checkFollow ? (DEFAULT_OPT_IN[lang] || DEFAULT_OPT_IN.tr).button : t("wizard.buttonText")}
              className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50 transition-colors"
            />
          </div>

          {checkFollow && (
            <div className="space-y-3 p-5 rounded-xl border border-accent-yellow/20 bg-accent-yellow/[0.03]">
              <SectionLabel>{t("wizard.ifNotFollowing")}</SectionLabel>
              <textarea
                value={followGateSubtitle}
                onChange={(e) => setFollowGateSubtitle(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-yellow/50 transition-colors"
                placeholder={(DEFAULT_GATE[lang] || DEFAULT_GATE.tr).subtitle}
              />
              <input
                value={followGateButton}
                onChange={(e) => setFollowGateButton(e.target.value)}
                placeholder={`✅ ${(DEFAULT_GATE[lang] || DEFAULT_GATE.tr).confirmBtn}`}
                className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50 transition-colors"
              />
            </div>
          )}

          {checkFollow && (
            <div className="space-y-3 p-5 rounded-xl border border-green-500/20 bg-green-500/[0.03]">
              <SectionLabel>{t("wizard.afterFollowing")}</SectionLabel>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-yellow/50 transition-colors"
                placeholder={t("wizard.contentMessage")}
              />
              <p className="text-[10px] text-muted-foreground font-mono-ui text-right">{messageText.length}/500</p>
              <input value={contentButtonText} onChange={(e) => setContentButtonText(e.target.value)} placeholder={t("wizard.buttonText")}
                className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50 transition-colors" />
              <input value={contentButtonUrl} onChange={(e) => setContentButtonUrl(e.target.value)} placeholder={t("wizard.buttonUrl")}
                className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50 transition-colors font-mono" />
            </div>
          )}

          {!checkFollow && triggerSource !== "comment" && (
            <div className="space-y-4">
              <SectionLabel>{t("form.dmFormat")}</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "text" as const, icon: <MessageCircle className="w-4 h-4" />, label: t("form.text") },
                  { key: "card" as const, icon: <Link2 className="w-4 h-4" />, label: t("form.card") },
                  { key: "media" as const, icon: <ImageIcon className="w-4 h-4" />, label: t("form.media") },
                ]).map(({ key, icon, label }) => (
                  <button key={key} type="button" onClick={() => setType(key)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${type === key ? "border-accent-yellow bg-accent-yellow/10 text-accent-yellow-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {type === "card" && (
                <div className="space-y-3 p-4 rounded-xl border border-border">
                  <input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} placeholder={t("form.cardTitle")} className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50" />
                  <input value={cardSubtitle} onChange={(e) => setCardSubtitle(e.target.value)} placeholder={t("form.cardSubtitle")} className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50" />
                  <input value={cardImage} onChange={(e) => setCardImage(e.target.value)} placeholder={t("form.cardImage")} className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("form.buttons")} ({buttons.length}/3)</span>
                    <button type="button" onClick={addButton} disabled={buttons.length >= 3} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 flex items-center gap-1"><Plus className="w-3 h-3" /> {t("form.addButton")}</button>
                  </div>
                  {buttons.map((btn) => (
                    <div key={btn.id} className="flex gap-2 items-center">
                      <input value={btn.title} onChange={(e) => updateButton(btn.id, "title", e.target.value)} className="flex-1 h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Button label" />
                      <input value={btn.type === "web_url" ? btn.url : btn.payload} onChange={(e) => updateButton(btn.id, btn.type === "web_url" ? "url" : "payload", e.target.value)} className="flex-1 h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-mono" placeholder={btn.type === "web_url" ? "https://link" : "flow_keyword"} />
                      <button type="button" onClick={() => removeButton(btn.id)} className="text-muted-foreground hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}

              {type === "media" && (
                <div className="space-y-3 p-4 rounded-xl border border-border">
                  <div className="grid grid-cols-3 gap-2">
                    {(["image", "video", "audio"] as const).map((m) => (
                      <button key={m} type="button" onClick={() => setMediaType(m)} className={`h-9 rounded-xl border text-xs font-bold transition-all ${mediaType === m ? "border-accent-yellow bg-accent-yellow/10 text-accent-yellow-foreground" : "border-border text-muted-foreground"}`}>
                        {m === "image" ? "Photo" : m === "video" ? "Video" : "Audio"}
                      </button>
                    ))}
                  </div>
                  <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder={t("form.mediaUrl")} className="w-full h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════ STEP 3: ADDITIONAL SETTINGS ═══════ */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="space-y-2">
            <SectionLabel>{t("wizard.automationName")}</SectionLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("form.ruleNamePlaceholder")}
              className="w-full h-11 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50 transition-colors" />
          </div>

          {triggerSource === "comment" && (
            <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("wizard.autoReplies")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("wizard.autoRepliesDesc")}</p>
                </div>
                <ToggleSwitch checked={replyMode !== "dm_only"} onChange={() => setReplyMode(replyMode === "dm_only" ? "both" : "dm_only")} />
              </div>

              {replyMode !== "dm_only" && (
                <div className="space-y-2 pt-2">
                  {publicReplies.map((reply, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5 text-center shrink-0">{idx + 1}</span>
                      <input value={reply} onChange={(e) => updatePublicReply(idx, e.target.value)} placeholder={`${t("wizard.replyField")} ${idx + 1}`}
                        className="flex-1 h-10 bg-muted/30 border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-yellow/50 transition-colors" />
                      {publicReplies.length > 1 && (
                        <button type="button" onClick={() => removePublicReply(idx)} className="text-muted-foreground hover:text-red-400 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  {publicReplies.length < 10 && (
                    <button type="button" onClick={addPublicReply} className="text-xs text-accent-yellow-foreground hover:underline flex items-center gap-1 mt-1">
                      {t("wizard.addAutoReply")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <ToggleCard icon={<Bell className="w-5 h-5" />} title={t("wizard.linkReminder")} description={t("wizard.linkReminderDesc")} checked={linkReminder} onChange={() => setLinkReminder(!linkReminder)} />
          <ToggleCard icon={<FileText className="w-5 h-5" />} title={t("wizard.extraMessage")} description={t("form.typingDesc")} checked={extraMessage} onChange={() => setExtraMessage(!extraMessage)} />
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between border-t border-border pt-5">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 h-11 px-5 rounded-full border border-border text-muted-foreground hover:text-foreground font-mono-ui text-xs font-bold transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t("wizard.back")}
          </button>
        ) : <div />}

        {step < 2 ? (
          <button type="button" onClick={() => { if (stepValid[step]) setStep(step + 1) }} disabled={!stepValid[step]}
            className="flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background font-mono-ui text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed ml-auto">
            {t("wizard.next")} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-accent-yellow text-black font-mono-ui text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed ml-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 stroke-[2.5]" />}
            {saving ? t("form.saving") : isEditing ? t("form.save") : "Go Live"}
          </button>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</p>
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`w-10 h-5.5 rounded-full relative transition-colors shrink-0 ${checked ? "bg-accent-yellow" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-black shadow-md transition-all ${checked ? "left-[20px]" : "left-0.5"}`} />
    </button>
  )
}

function ToggleCard({ icon, title, description, checked, onChange }: {
  icon: React.ReactNode; title: string; description: string; checked: boolean; onChange: () => void
}) {
  return (
    <button type="button" onClick={onChange}
      className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all ${checked ? "border-accent-yellow/40 bg-accent-yellow/[0.03]" : "border-border hover:border-foreground/20"}`}>
      <span className={checked ? "text-accent-yellow-foreground" : "text-muted-foreground"}>{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
      </span>
      <ToggleSwitch checked={checked} onChange={() => {}} />
    </button>
  )
}
