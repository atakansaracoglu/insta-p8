export const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
] as const

export type LangCode = (typeof LANGUAGES)[number]["code"]

const COOKIE_KEY = "insta_lang"

export function getLang(): LangCode {
  if (typeof window === "undefined") return "tr"
  try {
    return (localStorage.getItem(COOKIE_KEY) as LangCode) || "tr"
  } catch {
    return "tr"
  }
}

export function setLang(code: LangCode) {
  try {
    localStorage.setItem(COOKIE_KEY, code)
  } catch {}
}

type Dict = Record<string, string>

const tr: Dict = {
  // Sidebar
  "nav.overview": "Genel Bakış",
  "nav.automations": "Otomasyonlar",
  "nav.inbox": "Gelen Kutusu",
  "nav.icebreakers": "Buz Kırıcılar",
  "nav.audience": "Kitle",
  "nav.analytics": "Analitik",
  "nav.settings": "Ayarlar",
  "nav.help": "Yardım Al",
  "nav.connected": "bağlı",

  // Dashboard
  "dash.title": "Genel Bakış",
  "dash.totalAutomations": "Toplam Otomasyon",
  "dash.activeTriggers": "Aktif Tetikleyiciler",
  "dash.audienceReached": "Ulaşılan Kitle",
  "dash.messagesSent": "Gönderilen Mesajlar",
  "dash.recentActivity": "Son Aktiviteler",
  "dash.noActivity": "Henüz aktivite yok.",

  // Automations
  "auto.title": "Otomasyonlar",
  "auto.subtitle": "Instagram yorumlarından, hikayelerden ve DM'lerden tetiklenen otomasyonlar.",
  "auto.create": "Otomasyon Oluştur",
  "auto.noRules": "Henüz otomasyon yok.",
  "auto.triggers": "tetikleme",
  "auto.edit": "Düzenle",
  "auto.delete": "Sil",

  // Create/Edit Rule Form
  "form.step1": "Adım 1",
  "form.step2": "Adım 2",
  "form.step3": "Adım 3",
  "form.triggerSource": "Tetikleyici Kaynağı",
  "form.comment": "Yorum",
  "form.story": "Hikaye",
  "form.dm": "DM",
  "form.triggerType": "Tetikleyici Türü",
  "form.keyword": "Anahtar Kelime",
  "form.replyAll": "Hepsine Yanıtla",
  "form.replyMode": "Yanıt Modu",
  "form.both": "Her İkisi",
  "form.dmOnly": "Sadece DM",
  "form.publicOnly": "Sadece Herkese Açık",
  "form.publicReplies": "Herkese açık yorum rotasyonu",
  "form.publicRepliesDesc": "3 farklı mesaj yazın. Rastgele döndürülür, insani görünsün diye.",
  "form.publicReply1Placeholder": "ör. \"DM'ini kontrol et! 📥\"",
  "form.publicReply2Placeholder": "ör. \"Gönderdim! 🔥\"",
  "form.publicReply3Placeholder": "ör. \"Gelen kutunu kontrol et! ✨\"",
  "form.dmFormat": "DM Formatı",
  "form.text": "Metin",
  "form.card": "Kart",
  "form.media": "Medya",
  "form.message": "Mesaj",
  "form.messagePlaceholder": "Mesajınızı yazın...",
  "form.cardTitle": "Kart Başlığı",
  "form.cardSubtitle": "Kart Alt Başlığı",
  "form.cardImage": "Resim URL",
  "form.buttons": "Butonlar",
  "form.addButton": "Buton Ekle",
  "form.quickReplies": "Hızlı Yanıtlar",
  "form.addQuickReply": "Hızlı Yanıt Ekle",
  "form.mediaType": "Medya Türü",
  "form.mediaUrl": "Medya URL",
  "form.mediaCaption": "Medya Açıklaması",
  "form.ruleName": "Otomasyon Adı",
  "form.ruleNamePlaceholder": "ör. \"Ücretsiz E-Kitap Tetikleyici\"",
  "form.deliveryOptions": "Gönderim Seçenekleri",
  "form.followGate": "Takip zorunluluğu",
  "form.followGateDesc": "Sadece takipçiler içeriği alır. Takip etmeyenlere önce takip isteği gönderilir.",
  "form.optInStep": "Adım 1 — Onay kartı (yorumdan sonra ilk mesaj)",
  "form.optInMessagePlaceholder": "Varsayılan: \"Mesajını almak için butona bas 👇\"",
  "form.optInButtonPlaceholder": "Varsayılan: \"Gönder 📩\"",
  "form.gateStep": "Adım 2 — Takip duvarı (takip etmiyorsa gösterilir)",
  "form.gateTitlePlaceholder": "Varsayılan: \"Kaçırmadan önce\"",
  "form.gateSubtitlePlaceholder": "Varsayılan: \"İçeriği görmek için takip et!\"",
  "form.gateFollowBtnPlaceholder": "Varsayılan: \"Takip Et\" (profil linki)",
  "form.gateConfirmBtnPlaceholder": "Varsayılan: \"Takip Ettim! ✅\" (onay butonu)",
  "form.delay": "Gecikme",
  "form.delayDesc": "Yanıttan önce bekle",
  "form.typing": "Yazıyor göstergesi",
  "form.typingDesc": "Yanıttan önce 'yazıyor...' göster",
  "form.save": "Kaydet",
  "form.saving": "Kaydediliyor...",
  "form.cancel": "İptal",
  "form.interactivePreview": "Canlı Önizleme",

  // Audience
  "audience.title": "Kitleniz",
  "audience.subtitle": "Otomasyonlarınızla etkileşime giren kişiler.",
  "audience.totalContacts": "Toplam Kişi",
  "audience.totalMessages": "Toplam Mesaj",
  "audience.botMessages": "Bot Mesajları",
  "audience.search": "Kişi ara...",
  "audience.noContacts": "Henüz kişi yok — ilk otomasyonunuz çalıştıktan sonra burada görünecekler.",
  "audience.noMatch": "Eşleşen kişi yok.",
  "audience.username": "Kullanıcı Adı",
  "audience.messages": "Mesajlar",
  "audience.botReplies": "Bot Yanıtları",
  "audience.firstContact": "İlk İletişim",
  "audience.lastActive": "Son Aktivite",

  // Analytics
  "analytics.title": "Performans",
  "analytics.totalTriggers": "Toplam Tetikleme",
  "analytics.botMessages": "Bot Mesajları",
  "analytics.received": "Gelen",
  "analytics.contacts": "Kişiler",
  "analytics.messagesOverTime": "Zaman İçinde Mesajlar",
  "analytics.topAutomations": "En Çok Tetiklenen Otomasyonlar",
  "analytics.noTriggers": "Henüz tetikleme kaydedilmedi.",
  "analytics.noData": "Henüz yeterli veri yok. Otomasyonlarınız çalıştıktan sonra grafikler görünecek.",
  "analytics.loadError": "Analitik yüklenemedi.",
  "analytics.sent": "Gönderilen",

  // Inbox
  "inbox.title": "Gelen Kutusu",
  "inbox.search": "Sohbet ara...",
  "inbox.noConversations": "Henüz sohbet yok.",
  "inbox.typeMessage": "Mesaj yaz...",
  "inbox.send": "Gönder",

  // Settings
  "settings.title": "Ayarlar",

  // Common
  "common.loading": "Yükleniyor...",
  "common.error": "Bir hata oluştu.",
  "common.logout": "Çıkış Yap",
  "common.comingSoon": "Yakında",
}

const en: Dict = {
  "nav.overview": "Overview",
  "nav.automations": "Automations",
  "nav.inbox": "Inbox",
  "nav.icebreakers": "Ice Breakers",
  "nav.audience": "Audience",
  "nav.analytics": "Analytics",
  "nav.settings": "Settings",
  "nav.help": "Get help",
  "nav.connected": "connected",

  "dash.title": "Overview",
  "dash.totalAutomations": "Total Automations",
  "dash.activeTriggers": "Active Triggers",
  "dash.audienceReached": "Audience Reached",
  "dash.messagesSent": "Messages Sent",
  "dash.recentActivity": "Recent Activity",
  "dash.noActivity": "No activity yet.",

  "auto.title": "Automations",
  "auto.subtitle": "Automations triggered by Instagram comments, stories, and DMs.",
  "auto.create": "Create Automation",
  "auto.noRules": "No automations yet.",
  "auto.triggers": "triggers",
  "auto.edit": "Edit",
  "auto.delete": "Delete",

  "form.step1": "Step 1",
  "form.step2": "Step 2",
  "form.step3": "Step 3",
  "form.triggerSource": "Trigger Source",
  "form.comment": "Comment",
  "form.story": "Story",
  "form.dm": "DM",
  "form.triggerType": "Trigger Type",
  "form.keyword": "Keyword",
  "form.replyAll": "Reply All",
  "form.replyMode": "Reply Mode",
  "form.both": "Both",
  "form.dmOnly": "DM Only",
  "form.publicOnly": "Public Only",
  "form.publicReplies": "Public comments rotation",
  "form.publicRepliesDesc": "Write 3 different messages. They'll be rotated randomly to look human.",
  "form.publicReply1Placeholder": 'e.g. "Check your DMs! 📥"',
  "form.publicReply2Placeholder": 'e.g. "Sent! 🔥"',
  "form.publicReply3Placeholder": 'e.g. "Check your inbox! ✨"',
  "form.dmFormat": "DM Format",
  "form.text": "Text",
  "form.card": "Card",
  "form.media": "Media",
  "form.message": "Message",
  "form.messagePlaceholder": "Type your message...",
  "form.cardTitle": "Card Title",
  "form.cardSubtitle": "Card Subtitle",
  "form.cardImage": "Image URL",
  "form.buttons": "Buttons",
  "form.addButton": "Add Button",
  "form.quickReplies": "Quick Replies",
  "form.addQuickReply": "Add Quick Reply",
  "form.mediaType": "Media Type",
  "form.mediaUrl": "Media URL",
  "form.mediaCaption": "Media Caption",
  "form.ruleName": "Automation Name",
  "form.ruleNamePlaceholder": 'e.g. "Free Ebook Download Trigger"',
  "form.deliveryOptions": "Delivery options",
  "form.followGate": "Follow gate required",
  "form.followGateDesc": "Only followers get the payload. Non-followers get follow prompt first.",
  "form.optInStep": "Step 1 — Opt-in card (first message after comment)",
  "form.optInMessagePlaceholder": 'Default: "Tap the button to receive your message 👇"',
  "form.optInButtonPlaceholder": 'Default: "Send 📩"',
  "form.gateStep": "Step 2 — Follow gate (shown if not following)",
  "form.gateTitlePlaceholder": 'Default: "Before you lose me"',
  "form.gateSubtitlePlaceholder": 'Default: "Follow to unlock this content!"',
  "form.gateFollowBtnPlaceholder": 'Default: "Follow" (profile link)',
  "form.gateConfirmBtnPlaceholder": 'Default: "I Followed! ✅" (confirm button)',
  "form.delay": "Delay",
  "form.delayDesc": "Wait before replying",
  "form.typing": "Typing indicator",
  "form.typingDesc": "Show 'typing...' before reply",
  "form.save": "Save",
  "form.saving": "Saving...",
  "form.cancel": "Cancel",
  "form.interactivePreview": "Interactive Preview",

  "audience.title": "Your contacts",
  "audience.subtitle": "People who interacted with your automations.",
  "audience.totalContacts": "Total Contacts",
  "audience.totalMessages": "Total Messages",
  "audience.botMessages": "Bot Messages Sent",
  "audience.search": "Search contacts...",
  "audience.noContacts": "No contacts yet — they'll appear after your first automation runs.",
  "audience.noMatch": "No matching contacts.",
  "audience.username": "Username",
  "audience.messages": "Messages",
  "audience.botReplies": "Bot Replies",
  "audience.firstContact": "First Contact",
  "audience.lastActive": "Last Active",

  "analytics.title": "Performance",
  "analytics.totalTriggers": "Total Triggers",
  "analytics.botMessages": "Bot Messages",
  "analytics.received": "Received",
  "analytics.contacts": "Contacts",
  "analytics.messagesOverTime": "Messages over time",
  "analytics.topAutomations": "Top automations by triggers",
  "analytics.noTriggers": "No triggers recorded yet.",
  "analytics.noData": "Not enough data yet. Charts will appear after your automations run.",
  "analytics.loadError": "Could not load analytics.",
  "analytics.sent": "Sent",

  "inbox.title": "Inbox",
  "inbox.search": "Search conversations...",
  "inbox.noConversations": "No conversations yet.",
  "inbox.typeMessage": "Type a message...",
  "inbox.send": "Send",

  "settings.title": "Settings",

  "common.loading": "Loading...",
  "common.error": "Something went wrong.",
  "common.logout": "Log out",
  "common.comingSoon": "Coming Soon",
}

const de: Dict = {
  "nav.overview": "Übersicht", "nav.automations": "Automatisierungen", "nav.inbox": "Posteingang",
  "nav.icebreakers": "Eisbrecher", "nav.audience": "Publikum", "nav.analytics": "Analytik",
  "nav.settings": "Einstellungen", "nav.help": "Hilfe", "nav.connected": "verbunden",
  "form.publicReply1Placeholder": 'z.B. "Schau in deine DMs! 📥"',
  "form.publicReply2Placeholder": 'z.B. "Gesendet! 🔥"',
  "form.publicReply3Placeholder": 'z.B. "Schau in deinen Posteingang! ✨"',
  "common.logout": "Abmelden",
}

const es: Dict = {
  "nav.overview": "Resumen", "nav.automations": "Automatizaciones", "nav.inbox": "Bandeja",
  "nav.icebreakers": "Rompehielos", "nav.audience": "Audiencia", "nav.analytics": "Analíticas",
  "nav.settings": "Ajustes", "nav.help": "Ayuda", "nav.connected": "conectado",
  "form.publicReply1Placeholder": 'ej. "¡Revisa tus DMs! 📥"',
  "form.publicReply2Placeholder": 'ej. "¡Enviado! 🔥"',
  "form.publicReply3Placeholder": 'ej. "¡Revisa tu bandeja! ✨"',
  "common.logout": "Cerrar sesión",
}

const fr: Dict = {
  "nav.overview": "Aperçu", "nav.automations": "Automatisations", "nav.inbox": "Boîte de réception",
  "nav.icebreakers": "Brise-glaces", "nav.audience": "Audience", "nav.analytics": "Analytique",
  "nav.settings": "Paramètres", "nav.help": "Aide", "nav.connected": "connecté",
  "form.publicReply1Placeholder": 'ex. "Vérifie tes DMs ! 📥"',
  "form.publicReply2Placeholder": 'ex. "Envoyé ! 🔥"',
  "form.publicReply3Placeholder": 'ex. "Regarde ta boîte ! ✨"',
  "common.logout": "Déconnexion",
}

const pt: Dict = {
  "nav.overview": "Visão Geral", "nav.automations": "Automações", "nav.inbox": "Caixa de Entrada",
  "nav.icebreakers": "Quebra-gelos", "nav.audience": "Audiência", "nav.analytics": "Analíticos",
  "nav.settings": "Configurações", "nav.help": "Ajuda", "nav.connected": "conectado",
  "form.publicReply1Placeholder": 'ex. "Confira suas DMs! 📥"',
  "form.publicReply2Placeholder": 'ex. "Enviado! 🔥"',
  "form.publicReply3Placeholder": 'ex. "Confira sua caixa! ✨"',
  "common.logout": "Sair",
}

const ru: Dict = {
  "nav.overview": "Обзор", "nav.automations": "Автоматизации", "nav.inbox": "Входящие",
  "nav.icebreakers": "Айсбрейкеры", "nav.audience": "Аудитория", "nav.analytics": "Аналитика",
  "nav.settings": "Настройки", "nav.help": "Помощь", "nav.connected": "подключён",
  "form.publicReply1Placeholder": 'напр. "Проверь ЛС! 📥"',
  "form.publicReply2Placeholder": 'напр. "Отправлено! 🔥"',
  "form.publicReply3Placeholder": 'напр. "Проверь входящие! ✨"',
  "common.logout": "Выйти",
}

const ar: Dict = {
  "nav.overview": "نظرة عامة", "nav.automations": "الأتمتة", "nav.inbox": "البريد الوارد",
  "nav.icebreakers": "كاسرات الجليد", "nav.audience": "الجمهور", "nav.analytics": "التحليلات",
  "nav.settings": "الإعدادات", "nav.help": "مساعدة", "nav.connected": "متصل",
  "form.publicReply1Placeholder": 'مثال: "تفقد رسائلك! 📥"',
  "form.publicReply2Placeholder": 'مثال: "تم الإرسال! 🔥"',
  "form.publicReply3Placeholder": 'مثال: "تفقد بريدك! ✨"',
  "common.logout": "تسجيل الخروج",
}

const zh: Dict = {
  "nav.overview": "概览", "nav.automations": "自动化", "nav.inbox": "收件箱",
  "nav.icebreakers": "破冰器", "nav.audience": "受众", "nav.analytics": "分析",
  "nav.settings": "设置", "nav.help": "帮助", "nav.connected": "已连接",
  "form.publicReply1Placeholder": '例如 "查看你的私信！📥"',
  "form.publicReply2Placeholder": '例如 "已发送！🔥"',
  "form.publicReply3Placeholder": '例如 "查看收件箱！✨"',
  "common.logout": "退出",
}

const hi: Dict = {
  "nav.overview": "अवलोकन", "nav.automations": "ऑटोमेशन", "nav.inbox": "इनबॉक्स",
  "nav.icebreakers": "आइसब्रेकर", "nav.audience": "दर्शक", "nav.analytics": "एनालिटिक्स",
  "nav.settings": "सेटिंग्स", "nav.help": "मदद", "nav.connected": "जुड़ा हुआ",
  "form.publicReply1Placeholder": 'जैसे "अपना DM चेक करो! 📥"',
  "form.publicReply2Placeholder": 'जैसे "भेज दिया! 🔥"',
  "form.publicReply3Placeholder": 'जैसे "इनबॉक्स चेक करो! ✨"',
  "common.logout": "लॉग आउट",
}

const dictionaries: Record<LangCode, Dict> = { tr, en, de, es, fr, pt, ru, ar, zh, hi }

export function t(key: string, lang?: LangCode): string {
  const l = lang || getLang()
  return dictionaries[l]?.[key] || dictionaries.en[key] || dictionaries.tr[key] || key
}

export const DEFAULT_PUBLIC_REPLIES: Record<LangCode, string[]> = {
  tr: ["DM'ini kontrol et! 📥", "Gönderdim! 🔥", "Gelen kutunu kontrol et! ✨"],
  en: ["Check your DMs! 📥", "Sent! 🔥", "Check inbox! ✨"],
  de: ["Schau in deine DMs! 📥", "Gesendet! 🔥", "Schau in deinen Posteingang! ✨"],
  es: ["¡Revisa tus DMs! 📥", "¡Enviado! 🔥", "¡Revisa tu bandeja! ✨"],
  fr: ["Vérifie tes DMs ! 📥", "Envoyé ! 🔥", "Regarde ta boîte ! ✨"],
  pt: ["Confira suas DMs! 📥", "Enviado! 🔥", "Confira sua caixa! ✨"],
  ru: ["Проверь ЛС! 📥", "Отправлено! 🔥", "Проверь входящие! ✨"],
  ar: ["تفقد رسائلك! 📥", "تم الإرسال! 🔥", "تفقد بريدك! ✨"],
  zh: ["查看你的私信！📥", "已发送！🔥", "查看收件箱！✨"],
  hi: ["अपना DM चेक करो! 📥", "भेज दिया! 🔥", "इनबॉक्स चेक करो! ✨"],
}

export const DEFAULT_OPT_IN: Record<LangCode, { message: string; button: string }> = {
  tr: { message: "Mesajını almak için butona bas 👇", button: "Gönder 📩" },
  en: { message: "Tap the button to receive your message 👇", button: "Send 📩" },
  de: { message: "Tippe auf den Button, um deine Nachricht zu erhalten 👇", button: "Senden 📩" },
  es: { message: "Toca el botón para recibir tu mensaje 👇", button: "Enviar 📩" },
  fr: { message: "Appuie sur le bouton pour recevoir ton message 👇", button: "Envoyer 📩" },
  pt: { message: "Toque no botão para receber sua mensagem 👇", button: "Enviar 📩" },
  ru: { message: "Нажми кнопку, чтобы получить сообщение 👇", button: "Отправить 📩" },
  ar: { message: "اضغط على الزر لاستلام رسالتك 👇", button: "إرسال 📩" },
  zh: { message: "点击按钮接收你的消息 👇", button: "发送 📩" },
  hi: { message: "अपना संदेश पाने के लिए बटन दबाएं 👇", button: "भेजें 📩" },
}

export const DEFAULT_GATE: Record<LangCode, { title: string; subtitle: string; followBtn: string; confirmBtn: string }> = {
  tr: { title: "Kaçırmadan önce", subtitle: "İçeriği görmek için takip et!", followBtn: "Takip Et", confirmBtn: "Takip Ettim! ✅" },
  en: { title: "Before you lose me", subtitle: "Follow to unlock this content!", followBtn: "Follow", confirmBtn: "I Followed! ✅" },
  de: { title: "Bevor du mich verlierst", subtitle: "Folge, um den Inhalt freizuschalten!", followBtn: "Folgen", confirmBtn: "Ich folge! ✅" },
  es: { title: "Antes de que me pierdas", subtitle: "¡Sígueme para desbloquear!", followBtn: "Seguir", confirmBtn: "¡Ya te sigo! ✅" },
  fr: { title: "Avant de me perdre", subtitle: "Suis-moi pour débloquer !", followBtn: "Suivre", confirmBtn: "Je suis abonné ! ✅" },
  pt: { title: "Antes de me perder", subtitle: "Siga para desbloquear!", followBtn: "Seguir", confirmBtn: "Já sigo! ✅" },
  ru: { title: "Пока не потерял", subtitle: "Подпишись, чтобы получить контент!", followBtn: "Подписаться", confirmBtn: "Подписался! ✅" },
  ar: { title: "قبل أن تفقدني", subtitle: "تابعني لفتح المحتوى!", followBtn: "متابعة", confirmBtn: "تابعت! ✅" },
  zh: { title: "别错过我", subtitle: "关注即可解锁内容！", followBtn: "关注", confirmBtn: "已关注！✅" },
  hi: { title: "मुझे मत खोना", subtitle: "कंटेंट अनलॉक करने के लिए फॉलो करें!", followBtn: "फॉलो करें", confirmBtn: "फॉलो किया! ✅" },
}
