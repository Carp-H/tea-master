import { getRecommendedVessels } from "../data/teaProfiles";
import type {
  BrewStrength,
  Language,
  RecipeQueryState,
  TeaType,
  Vessel
} from "../types";

const languages: Language[] = ["zh", "en", "de"];
const teaTypes: TeaType[] = ["green", "white", "black", "oolong", "dark"];
const strengths: BrewStrength[] = ["light", "standard", "strong"];

export function parseRecipeQueryState(
  search: string,
  fallback: RecipeQueryState
): RecipeQueryState {
  const params = new URLSearchParams(search);
  const tea = parseTeaType(params.get("tea")) ?? fallback.tea;
  const vessels = getRecommendedVessels(tea);
  const fallbackVessel = vessels.includes(fallback.vessel)
    ? fallback.vessel
    : vessels[0];
  const parsedVessel = parseVessel(params.get("vessel"));
  const vessel =
    parsedVessel !== undefined && vessels.includes(parsedVessel)
      ? parsedVessel
      : fallbackVessel;

  return {
    lang: parseLanguage(params.get("lang")) ?? fallback.lang,
    tea,
    vessel,
    water: parsePositiveInteger(params.get("water")) ?? fallback.water,
    ratio: parsePositiveInteger(params.get("ratio")) ?? fallback.ratio,
    strength: parseStrength(params.get("strength")) ?? fallback.strength
  };
}

function parseLanguage(value: string | null): Language | undefined {
  return languages.includes(value as Language) ? (value as Language) : undefined;
}

function parseTeaType(value: string | null): TeaType | undefined {
  return teaTypes.includes(value as TeaType) ? (value as TeaType) : undefined;
}

function parseVessel(value: string | null): Vessel | undefined {
  const vessels: Vessel[] = [
    "glass_cup",
    "gaiwan",
    "porcelain_pot",
    "zisha_clay_pot"
  ];
  return vessels.includes(value as Vessel) ? (value as Vessel) : undefined;
}

function parseStrength(value: string | null): BrewStrength | undefined {
  return strengths.includes(value as BrewStrength)
    ? (value as BrewStrength)
    : undefined;
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (value === null || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;
}
