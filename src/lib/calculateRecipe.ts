import type { BrewingRecipe, RecipeRequest } from "../types";
import { getBrewingGuide } from "../data/brewingGuides";
import { getRecommendedVessels } from "../data/teaProfiles";

export function calculateRecipe(request: RecipeRequest): BrewingRecipe {
  const vessels = getRecommendedVessels(request.teaType);
  if (!vessels.includes(request.vessel)) {
    throw new Error(
      `Vessel ${request.vessel} is not available for tea type ${request.teaType}`
    );
  }

  const guide = getBrewingGuide(request.teaType, request.vessel);
  if (!guide) {
    throw new Error(
      `No brewing guide for tea type ${request.teaType} with vessel ${request.vessel}`
    );
  }

  const people = clampPeople(request.people);
  const waterMl = people * guide.waterPerPersonMl;

  return {
    teaType: request.teaType,
    vessel: request.vessel,
    people,
    waterMl,
    teaGrams: roundToHalf(waterMl / guide.ratioMlPerGram),
    ratioMlPerGram: guide.ratioMlPerGram,
    temperatureC: guide.temperatureC,
    rinseSeconds: guide.rinseSeconds,
    infusions: guide.infusionSeconds.map((seconds, index) => ({
      index: index + 1,
      seconds
    }))
  };
}

function clampPeople(people: number): number {
  return Math.min(8, Math.max(1, Math.round(people)));
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
