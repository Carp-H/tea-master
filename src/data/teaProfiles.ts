import type { TeaProfile, TeaType, Vessel } from "../types";

const vesselRecommendations: Record<TeaType, Vessel[]> = {
  green: ["glass_cup"],
  white: ["gaiwan"],
  black: ["gaiwan", "porcelain_pot"],
  oolong: ["gaiwan"],
  dark: ["gaiwan", "zisha_pot", "clay_pot"]
};

export const teaProfiles: TeaProfile[] = Object.entries(vesselRecommendations).map(
  ([id, vessels]) => ({
    id: id as TeaType,
    vessels
  })
);

export function getRecommendedVessels(teaType: TeaType): Vessel[] {
  return [...vesselRecommendations[teaType]];
}
