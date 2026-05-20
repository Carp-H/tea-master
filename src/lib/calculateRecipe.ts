import type {
  BrewingGuideInfusion,
  BrewingGuideRinse,
  BrewingRecipe,
  RecipeRequest
} from "../types";
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

  const recommendedWaterMl = guide.vesselCapacityMl;
  const waterMl = resolveWaterMl(request.waterMl, recommendedWaterMl);
  const rinses: BrewingGuideRinse[] =
    guide.rinses ??
    (guide.rinseSeconds === undefined
      ? []
      : [
          {
            seconds: guide.rinseSeconds,
            ...(guide.rinseDetailKey
              ? { detailKey: guide.rinseDetailKey }
              : {})
          }
        ]);
  const infusions: BrewingGuideInfusion[] =
    guide.infusions ??
    guide.infusionSeconds?.map((seconds) => ({ seconds })) ??
    [];

  return {
    teaType: request.teaType,
    vessel: request.vessel,
    waterMl,
    teaGrams: roundToHalf(waterMl / guide.ratioMlPerGram),
    ratioMlPerGram: guide.ratioMlPerGram,
    ratioMlPerGramRange: guide.ratioMlPerGramRange,
    temperatureC: guide.temperatureC,
    temperatureCRange: guide.temperatureCRange,
    rinses: rinses.map((rinse, index) => ({
      index: index + 1,
      seconds: rinse.seconds,
      ...(rinse.detailKey ? { detailKey: rinse.detailKey } : {})
    })),
    rinseSeconds: guide.rinseSeconds,
    rinseDetailKey: guide.rinseDetailKey,
    infusions: infusions.map((infusion, index) => ({
      index: index + 1,
      seconds: infusion.seconds,
      ...(infusion.detailKey ? { detailKey: infusion.detailKey } : {}),
      ...(infusion.optional ? { optional: infusion.optional } : {})
    }))
  };
}

function resolveWaterMl(waterMl: number | undefined, fallbackWaterMl: number): number {
  if (waterMl === undefined || !Number.isFinite(waterMl)) {
    return fallbackWaterMl;
  }

  return Math.max(1, Math.round(waterMl));
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
