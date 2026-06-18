export type TeaType =
  | "green"
  | "white"
  | "black"
  | "oolong"
  | "dark";

export type Vessel =
  | "glass_cup"
  | "gaiwan"
  | "porcelain_pot"
  | "zisha_clay_pot";

export type Language = "zh" | "en" | "de";

export type BrewStrength = "light" | "standard" | "strong";

export type InfusionDetailKey =
  | "standard"
  | "immediate"
  | "green_first"
  | "green_refill"
  | "green_optional"
  | "white_rinse"
  | "white_first"
  | "white_second";

export interface TeaProfile {
  id: TeaType;
  vessels: Vessel[];
}

export interface RecipeRequest {
  teaType: TeaType;
  vessel: Vessel;
  waterMl?: number;
  language?: Language;
}

export interface RecipeQueryState {
  lang: Language;
  tea: TeaType;
  vessel: Vessel;
  water: number;
  ratio: number;
  strength: BrewStrength;
}

export interface InfusionStep {
  index: number;
  seconds: number;
  detailKey?: InfusionDetailKey;
  optional?: boolean;
}

export interface RinseStep {
  index: number;
  seconds: number;
  detailKey?: InfusionDetailKey;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface BrewingRecipe {
  teaType: TeaType;
  vessel: Vessel;
  waterMl: number;
  teaGrams: number;
  ratioMlPerGram: number;
  ratioMlPerGramRange?: NumericRange;
  temperatureC: number;
  temperatureCRange?: NumericRange;
  rinses: RinseStep[];
  rinseSeconds?: number;
  rinseDetailKey?: InfusionDetailKey;
  infusions: InfusionStep[];
}

export interface BrewingGuideInfusion {
  seconds: number;
  detailKey?: InfusionDetailKey;
  optional?: boolean;
}

export interface BrewingGuideRinse {
  seconds: number;
  detailKey?: InfusionDetailKey;
}

export interface BrewingGuide {
  teaType: TeaType;
  vessel: Vessel;
  vesselCapacityMl: number;
  ratioMlPerGram: number;
  strengthRatios?: Record<BrewStrength, number>;
  ratioMlPerGramRange?: NumericRange;
  temperatureC: number;
  temperatureCRange?: NumericRange;
  rinses?: BrewingGuideRinse[];
  rinseSeconds?: number;
  rinseDetailKey?: InfusionDetailKey;
  infusionSeconds?: number[];
  infusions?: BrewingGuideInfusion[];
}
