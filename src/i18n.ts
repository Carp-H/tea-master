import type { Language, TeaType, Vessel } from "./types";

export interface Copy {
  appName: string;
  subtitle: string;
  footerCredit: string;
  language: string;
  chooseTea: string;
  recommendedVessel: string;
  recommendation: string;
  vessel: string;
  water: string;
  teaAmount: string;
  ratio: string;
  temperature: string;
  infusionCount: string;
  infusionCountUnit: string;
  rangeMinLabel: string;
  rangeMaxLabel: string;
  feedbackTitle: string;
  feedbackRatingLabel: string;
  ratingExcellent: string;
  ratingGood: string;
  ratingOkay: string;
  exportImage: string;
  exportPdf: string;
  feedbackComment: string;
  feedbackPlaceholder: string;
  submitFeedback: string;
  feedbackSaved: string;
  imageExported: string;
  pdfOpened: string;
  exportFailed: string;
  process: string;
  prepare: string;
  prepareDetail: string;
  rinse: string;
  rinseWithIndex: string;
  rinseDetail: string;
  rinseImmediateDetail: string;
  rinseDiscardHint: string;
  infusion: string;
  optionalInfusion: string;
  infusionDetail: string;
  immediateInfusionDetail: string;
  greenFirstInfusionDetail: string;
  greenRefillInfusionDetail: string;
  greenOptionalInfusionDetail: string;
  greenOptionalDuration: string;
  greenCupHint: string;
  whiteRinseDetail: string;
  whiteFirstInfusionDetail: string;
  whiteSecondInfusionDetail: string;
  whiteFirstDuration: string;
  whiteSecondDuration: string;
  timer: string;
  ready: string;
  running: string;
  paused: string;
  completed: string;
  readyToSipStatus: string;
  readyToSip: string;
  start: string;
  nextInfusion: string;
  pause: string;
  resume: string;
  reset: string;
  pourOut: string;
  allDone: string;
  grams: string;
  milliliters: string;
  seconds: string;
  teaNames: Record<TeaType, string>;
  vesselNames: Record<Vessel, string>;
}

export const languageNames: Record<Language, string> = {
  zh: "中文",
  en: "English",
  de: "Deutsch"
};

export const copies: Record<Language, Copy> = {
  zh: {
    appName: "Tea Master",
    subtitle: "选茶、选器、按主泡器容量生成泡茶流程",
    footerCredit: "LH与Codex通力合作，诚意呈现。",
    language: "语言",
    chooseTea: "选择茶类",
    recommendedVessel: "推荐主泡器",
    recommendation: "推荐参数",
    vessel: "主泡器",
    water: "注水量",
    teaAmount: "投茶量",
    ratio: "茶水比",
    temperature: "水温",
    infusionCount: "推荐冲泡次数",
    infusionCountUnit: "泡",
    rangeMinLabel: "下限",
    rangeMaxLabel: "上限",
    feedbackTitle: "反馈与分享",
    feedbackRatingLabel: "评价体验",
    ratingExcellent: "很满意",
    ratingGood: "不错",
    ratingOkay: "一般",
    exportImage: "导出图片",
    exportPdf: "导出 PDF",
    feedbackComment: "留言反馈",
    feedbackPlaceholder: "写下你的体验、建议或想保留的茶席笔记。",
    submitFeedback: "提交反馈",
    feedbackSaved: "反馈已记录，谢谢。",
    imageExported: "配方图片已保存。",
    pdfOpened: "PDF 保存窗口已打开。",
    exportFailed: "导出未完成，请再试一次。",
    process: "泡茶流程",
    prepare: "准备",
    prepareDetail: "温杯洁具，放入茶叶，备好推荐水温。",
    rinse: "润茶",
    rinseWithIndex: "润茶 {index}",
    rinseDetail: "快速注水后倒出，用来唤醒茶叶。",
    rinseImmediateDetail: "即进即出，用来继续唤醒茶叶。",
    rinseDiscardHint: "小提示：润茶倒出的茶水不饮用。",
    infusion: "第 {index} 泡",
    optionalInfusion: "可选第 {index} 泡",
    infusionDetail: "计时结束后立即出汤。",
    immediateInfusionDetail: "即冲即出。",
    greenFirstInfusionDetail: "用 80/85°C 水冲泡，玻璃杯久坐，计时结束后可直接饮用。",
    greenRefillInfusionDetail: "第一泡喝到约剩三分之一时，用 100°C 沸水续满，继续浸泡。",
    greenOptionalInfusionDetail: "再次喝到约剩三分之一时，重新注入 100°C 热水，可按口味浸泡。",
    greenOptionalDuration: "3–5 分钟",
    greenCupHint: "杯中浸泡",
    whiteRinseDetail: "用 100°C 水冲淋茶叶后立刻倒出。",
    whiteFirstInfusionDetail: "继续用 100°C 水冲泡茶叶，坐杯完成后出汤。",
    whiteSecondInfusionDetail: "继续用 100°C 水冲泡茶叶，保持短坐杯后出汤。",
    whiteFirstDuration: "20–30 秒",
    whiteSecondDuration: "25–30 秒",
    timer: "逐泡计时",
    ready: "准备开始",
    running: "计时中",
    paused: "已暂停",
    completed: "已完成",
    readyToSipStatus: "请品尝",
    readyToSip: "您的茶好了，请慢慢品尝。",
    start: "开始",
    nextInfusion: "开始下一泡",
    pause: "暂停",
    resume: "继续",
    reset: "重置",
    pourOut: "出汤",
    allDone: "流程完成，可以按口味继续延长下一泡。",
    grams: "克",
    milliliters: "毫升",
    seconds: "秒",
    teaNames: {
      green: "绿茶",
      white: "白茶",
      black: "红茶",
      oolong: "乌龙",
      dark: "黑茶"
    },
    vesselNames: {
      glass_cup: "玻璃杯",
      gaiwan: "盖碗",
      porcelain_pot: "瓷壶",
      zisha_clay_pot: "紫砂壶/陶壶"
    }
  },
  en: {
    appName: "Tea Master",
    subtitle: "Choose tea and vessel, then brew by vessel capacity",
    footerCredit: "Designed with great passion by LH, in collaboration with Codex.",
    language: "Language",
    chooseTea: "Tea type",
    recommendedVessel: "Recommended vessel",
    recommendation: "Recommendation",
    vessel: "Vessel",
    water: "Water",
    teaAmount: "Tea leaves",
    ratio: "Tea-water ratio",
    temperature: "Water temp",
    infusionCount: "Recommended infusions",
    infusionCountUnit: "infusions",
    rangeMinLabel: "minimum",
    rangeMaxLabel: "maximum",
    feedbackTitle: "Feedback & sharing",
    feedbackRatingLabel: "Rate the experience",
    ratingExcellent: "Loved it",
    ratingGood: "Good",
    ratingOkay: "Okay",
    exportImage: "Export image",
    exportPdf: "Export PDF",
    feedbackComment: "Feedback note",
    feedbackPlaceholder: "Write your experience, suggestion, or tea-session note.",
    submitFeedback: "Submit feedback",
    feedbackSaved: "Feedback recorded. Thank you.",
    imageExported: "Recipe image saved.",
    pdfOpened: "PDF save window opened.",
    exportFailed: "Export did not finish. Please try again.",
    process: "Brewing flow",
    prepare: "Prepare",
    prepareDetail: "Warm the vessel, add tea leaves, and prepare water.",
    rinse: "Rinse",
    rinseWithIndex: "Rinse {index}",
    rinseDetail: "Pour in water briefly, then discard it to wake the leaves.",
    rinseImmediateDetail: "Pour in and out immediately to keep waking the leaves.",
    rinseDiscardHint: "Tip: Do not drink the rinse liquor.",
    infusion: "Infusion {index}",
    optionalInfusion: "Optional infusion {index}",
    infusionDetail: "Pour out as soon as the timer ends.",
    immediateInfusionDetail: "Pour out immediately.",
    greenFirstInfusionDetail: "Brew with 80/85°C water in the glass cup, then drink directly from the cup.",
    greenRefillInfusionDetail: "When about one third remains, refill with 100°C boiling water and steep again.",
    greenOptionalInfusionDetail: "When about one third remains again, refill with 100°C water and steep to taste.",
    greenOptionalDuration: "3–5 min",
    greenCupHint: "Steeping in cup",
    whiteRinseDetail: "Rinse the leaves with 100°C water, then pour out immediately.",
    whiteFirstInfusionDetail: "Continue with 100°C water and pour out after the steep.",
    whiteSecondInfusionDetail: "Continue with 100°C water, keeping a short steep before pouring out.",
    whiteFirstDuration: "20–30 sec",
    whiteSecondDuration: "25–30 sec",
    timer: "Infusion timer",
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    completed: "Completed",
    readyToSipStatus: "Enjoy",
    readyToSip: "Your tea is ready. Sip slowly.",
    start: "Start",
    nextInfusion: "Start next infusion",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    pourOut: "Pour out",
    allDone: "Flow complete. Extend later infusions to taste.",
    grams: "g",
    milliliters: "ml",
    seconds: "sec",
    teaNames: {
      green: "Green",
      white: "White",
      black: "Black",
      oolong: "Oolong",
      dark: "Dark"
    },
    vesselNames: {
      glass_cup: "Glass cup",
      gaiwan: "Gaiwan",
      porcelain_pot: "Porcelain pot",
      zisha_clay_pot: "Zisha/clay pot"
    }
  },
  de: {
    appName: "Tea Master",
    subtitle: "Tee und Gefäß wählen, dann nach Gefäßvolumen brühen",
    footerCredit: "Von LH herzlich gestaltet, in Zusammenarbeit mit Codex.",
    language: "Sprache",
    chooseTea: "Teeart",
    recommendedVessel: "Empfohlenes Gefäß",
    recommendation: "Empfehlung",
    vessel: "Gefäß",
    water: "Wasser",
    teaAmount: "Teemenge",
    ratio: "Tee-Wasser-Verhältnis",
    temperature: "Wassertemperatur",
    infusionCount: "Empfohlene Aufgüsse",
    infusionCountUnit: "Aufgüsse",
    rangeMinLabel: "Minimum",
    rangeMaxLabel: "Maximum",
    feedbackTitle: "Feedback & Teilen",
    feedbackRatingLabel: "Erlebnis bewerten",
    ratingExcellent: "Sehr zufrieden",
    ratingGood: "Gut",
    ratingOkay: "In Ordnung",
    exportImage: "Bild exportieren",
    exportPdf: "PDF exportieren",
    feedbackComment: "Feedback-Nachricht",
    feedbackPlaceholder: "Notieren Sie Ihre Erfahrung, Vorschläge oder Teerunden-Notizen.",
    submitFeedback: "Feedback senden",
    feedbackSaved: "Feedback wurde notiert. Vielen Dank.",
    imageExported: "Rezeptbild gespeichert.",
    pdfOpened: "PDF-Speicherfenster wurde geöffnet.",
    exportFailed: "Export nicht abgeschlossen. Bitte erneut versuchen.",
    process: "Brühablauf",
    prepare: "Vorbereiten",
    prepareDetail: "Gefäß vorwärmen, Tee einfüllen und Wasser vorbereiten.",
    rinse: "Spülen",
    rinseWithIndex: "Spülen {index}",
    rinseDetail: "Kurz aufgießen und abgießen, um die Blätter zu wecken.",
    rinseImmediateDetail: "Sofort aufgießen und abgießen, um die Blätter weiter zu wecken.",
    rinseDiscardHint: "Hinweis: Der Spülaufguss wird nicht getrunken.",
    infusion: "Aufguss {index}",
    optionalInfusion: "Optionaler Aufguss {index}",
    infusionDetail: "Nach Ablauf der Zeit sofort abgießen.",
    immediateInfusionDetail: "Sofort abgießen.",
    greenFirstInfusionDetail: "Mit 80/85°C heißem Wasser im Glasbecher aufgießen und direkt aus dem Becher trinken.",
    greenRefillInfusionDetail: "Wenn noch etwa ein Drittel übrig ist, mit 100°C kochendem Wasser auffüllen und weiter ziehen lassen.",
    greenOptionalInfusionDetail: "Wieder bei etwa einem Drittel Rest mit 100°C heißem Wasser auffüllen und nach Geschmack ziehen lassen.",
    greenOptionalDuration: "3–5 Min.",
    greenCupHint: "Im Becher ziehen lassen",
    whiteRinseDetail: "Die Blätter mit 100°C heißem Wasser spülen und sofort abgießen.",
    whiteFirstInfusionDetail: "Mit 100°C heißem Wasser weiter aufgießen und nach dem Ziehen abgießen.",
    whiteSecondInfusionDetail: "Mit 100°C heißem Wasser weiter aufgießen, kurz ziehen lassen und abgießen.",
    whiteFirstDuration: "20–30 Sek.",
    whiteSecondDuration: "25–30 Sek.",
    timer: "Aufguss-Timer",
    ready: "Bereit",
    running: "Läuft",
    paused: "Pausiert",
    completed: "Fertig",
    readyToSipStatus: "Genießen",
    readyToSip: "Ihr Tee ist fertig. Genießen Sie ihn in Ruhe.",
    start: "Start",
    nextInfusion: "Nächsten Aufguss starten",
    pause: "Pause",
    resume: "Weiter",
    reset: "Zurücksetzen",
    pourOut: "Abgießen",
    allDone: "Ablauf fertig. Weitere Aufgüsse nach Geschmack verlängern.",
    grams: "g",
    milliliters: "ml",
    seconds: "Sek.",
    teaNames: {
      green: "Grüntee",
      white: "Weißer Tee",
      black: "Schwarzer Tee",
      oolong: "Oolong",
      dark: "Dunkler Tee"
    },
    vesselNames: {
      glass_cup: "Glasbecher",
      gaiwan: "Gaiwan",
      porcelain_pot: "Porzellankanne",
      zisha_clay_pot: "Zisha-/Tonkanne"
    }
  }
};

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}
