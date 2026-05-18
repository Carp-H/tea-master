import type { Language, TeaType, Vessel } from "./types";

export interface Copy {
  appName: string;
  subtitle: string;
  language: string;
  chooseTea: string;
  people: string;
  decreasePeople: string;
  increasePeople: string;
  recommendedVessel: string;
  recommendation: string;
  vessel: string;
  water: string;
  teaAmount: string;
  ratio: string;
  temperature: string;
  process: string;
  prepare: string;
  prepareDetail: string;
  rinse: string;
  rinseDetail: string;
  infusion: string;
  infusionDetail: string;
  timer: string;
  ready: string;
  running: string;
  paused: string;
  completed: string;
  start: string;
  pause: string;
  resume: string;
  reset: string;
  pourOut: string;
  allDone: string;
  grams: string;
  milliliters: string;
  seconds: string;
  peopleUnit: string;
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
    subtitle: "选茶、选器、按人数生成泡茶流程",
    language: "语言",
    chooseTea: "选择茶类",
    people: "喝茶人数",
    decreasePeople: "减少人数",
    increasePeople: "增加人数",
    recommendedVessel: "推荐主泡器",
    recommendation: "推荐参数",
    vessel: "主泡器",
    water: "用水量",
    teaAmount: "投茶量",
    ratio: "茶水比",
    temperature: "水温",
    process: "泡茶流程",
    prepare: "准备",
    prepareDetail: "温杯洁具，放入茶叶，备好推荐水温。",
    rinse: "润茶",
    rinseDetail: "快速注水后倒出，用来唤醒茶叶。",
    infusion: "第 {index} 泡",
    infusionDetail: "计时结束后立即出汤。",
    timer: "逐泡计时",
    ready: "准备开始",
    running: "计时中",
    paused: "已暂停",
    completed: "已完成",
    start: "开始",
    pause: "暂停",
    resume: "继续",
    reset: "重置",
    pourOut: "出汤",
    allDone: "流程完成，可以按口味继续延长下一泡。",
    grams: "克",
    milliliters: "毫升",
    seconds: "秒",
    peopleUnit: "人",
    teaNames: {
      green: "绿茶",
      yellow: "黄茶",
      white: "白茶",
      black: "红茶",
      oolong: "乌龙",
      dark: "黑茶",
      puerh_raw: "普洱生茶",
      puerh_ripe: "普洱熟茶"
    },
    vesselNames: {
      glass_cup: "玻璃杯",
      gaiwan: "盖碗",
      porcelain_pot: "瓷壶",
      zisha_pot: "紫砂壶",
      clay_pot: "陶壶"
    }
  },
  en: {
    appName: "Tea Master",
    subtitle: "Choose tea and vessel, then brew by people count",
    language: "Language",
    chooseTea: "Tea type",
    people: "People",
    decreasePeople: "Decrease people",
    increasePeople: "Increase people",
    recommendedVessel: "Recommended vessel",
    recommendation: "Recommendation",
    vessel: "Vessel",
    water: "Water",
    teaAmount: "Tea leaves",
    ratio: "Tea-water ratio",
    temperature: "Water temp",
    process: "Brewing flow",
    prepare: "Prepare",
    prepareDetail: "Warm the vessel, add tea leaves, and prepare water.",
    rinse: "Rinse",
    rinseDetail: "Pour in water briefly, then discard it to wake the leaves.",
    infusion: "Infusion {index}",
    infusionDetail: "Pour out as soon as the timer ends.",
    timer: "Infusion timer",
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    completed: "Completed",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    pourOut: "Pour out",
    allDone: "Flow complete. Extend later infusions to taste.",
    grams: "g",
    milliliters: "ml",
    seconds: "sec",
    peopleUnit: "people",
    teaNames: {
      green: "Green",
      yellow: "Yellow",
      white: "White",
      black: "Black",
      oolong: "Oolong",
      dark: "Dark",
      puerh_raw: "Raw Pu-erh",
      puerh_ripe: "Ripe Pu-erh"
    },
    vesselNames: {
      glass_cup: "Glass cup",
      gaiwan: "Gaiwan",
      porcelain_pot: "Porcelain pot",
      zisha_pot: "Zisha pot",
      clay_pot: "Clay pot"
    }
  },
  de: {
    appName: "Tea Master",
    subtitle: "Tee und Gefass wahlen, dann nach Personenzahl bruhen",
    language: "Sprache",
    chooseTea: "Teeart",
    people: "Personen",
    decreasePeople: "Personenzahl verringern",
    increasePeople: "Personenzahl erhohen",
    recommendedVessel: "Empfohlenes Gefass",
    recommendation: "Empfehlung",
    vessel: "Gefass",
    water: "Wasser",
    teaAmount: "Teemenge",
    ratio: "Tee-Wasser-Verhaltnis",
    temperature: "Wassertemperatur",
    process: "Brühablauf",
    prepare: "Vorbereiten",
    prepareDetail: "Gefass vorwarmen, Tee einfullen und Wasser vorbereiten.",
    rinse: "Spulen",
    rinseDetail: "Kurz aufgiessen und abgiessen, um die Blatter zu wecken.",
    infusion: "Aufguss {index}",
    infusionDetail: "Nach Ablauf der Zeit sofort abgiessen.",
    timer: "Aufguss-Timer",
    ready: "Bereit",
    running: "Lauft",
    paused: "Pausiert",
    completed: "Fertig",
    start: "Start",
    pause: "Pause",
    resume: "Weiter",
    reset: "Zurucksetzen",
    pourOut: "Abgiessen",
    allDone: "Ablauf fertig. Weitere Aufgusse nach Geschmack verlangern.",
    grams: "g",
    milliliters: "ml",
    seconds: "Sek.",
    peopleUnit: "Pers.",
    teaNames: {
      green: "Gruntee",
      yellow: "Gelber Tee",
      white: "Weisser Tee",
      black: "Schwarzer Tee",
      oolong: "Oolong",
      dark: "Dunkler Tee",
      puerh_raw: "Roher Pu-Erh",
      puerh_ripe: "Reifer Pu-Erh"
    },
    vesselNames: {
      glass_cup: "Glasbecher",
      gaiwan: "Gaiwan",
      porcelain_pot: "Porzellankanne",
      zisha_pot: "Zisha-Kanne",
      clay_pot: "Tonkanne"
    }
  }
};

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}
