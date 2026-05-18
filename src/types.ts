export type TeaType =
  | "green"
  | "yellow"
  | "white"
  | "black"
  | "oolong"
  | "dark"
  | "puerh_raw"
  | "puerh_ripe";

export type Vessel =
  | "glass_cup"
  | "gaiwan"
  | "porcelain_pot"
  | "zisha_pot"
  | "clay_pot";

export type Language = "zh" | "en" | "de";

export interface TeaProfile {
  id: TeaType;
  vessels: Vessel[];
}

export interface RecipeRequest {
  teaType: TeaType;
  vessel: Vessel;
  people: number;
  language?: Language;
}

export interface InfusionStep {
  index: number;
  seconds: number;
}

export interface BrewingRecipe {
  teaType: TeaType;
  vessel: Vessel;
  people: number;
  waterMl: number;
  teaGrams: number;
  ratioMlPerGram: number;
  temperatureC: number;
  rinseSeconds?: number;
  infusions: InfusionStep[];
}

export interface BrewingGuide {
  teaType: TeaType;
  vessel: Vessel;
  waterPerPersonMl: number;
  ratioMlPerGram: number;
  temperatureC: number;
  rinseSeconds?: number;
  infusionSeconds: number[];
}
