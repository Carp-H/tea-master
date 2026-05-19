import type { BrewingGuide, TeaType, Vessel } from "../types";

export const brewingGuides: BrewingGuide[] = [
  {
    teaType: "green",
    vessel: "glass_cup",
    vesselCapacityMl: 250,
    ratioMlPerGram: 100,
    temperatureC: 80,
    temperatureCRange: { min: 80, max: 100 },
    infusions: [
      { seconds: 120, detailKey: "green_first" },
      { seconds: 180, detailKey: "green_refill" },
      { seconds: 180, detailKey: "green_optional", optional: true }
    ]
  },
  {
    teaType: "white",
    vessel: "gaiwan",
    vesselCapacityMl: 110,
    ratioMlPerGram: 30,
    ratioMlPerGramRange: { min: 20, max: 40 },
    temperatureC: 100,
    rinseSeconds: 0,
    rinseDetailKey: "white_rinse",
    infusions: [
      { seconds: 25, detailKey: "white_first" },
      { seconds: 30, detailKey: "white_second" },
      { seconds: 35 },
      { seconds: 40 },
      { seconds: 45 },
      { seconds: 50 },
      { seconds: 55, optional: true }
    ]
  },
  {
    teaType: "black",
    vessel: "gaiwan",
    vesselCapacityMl: 110,
    ratioMlPerGram: 30,
    temperatureC: 100,
    infusionSeconds: [20, 20, 25, 30, 40, 50]
  },
  {
    teaType: "black",
    vessel: "porcelain_pot",
    vesselCapacityMl: 230,
    ratioMlPerGram: 100,
    temperatureC: 90,
    temperatureCRange: { min: 90, max: 100 },
    infusions: [
      { seconds: 120 },
      { seconds: 180 },
      { seconds: 300, optional: true }
    ]
  },
  {
    teaType: "oolong",
    vessel: "gaiwan",
    vesselCapacityMl: 110,
    ratioMlPerGram: 15,
    ratioMlPerGramRange: { min: 15, max: 20 },
    temperatureC: 95,
    temperatureCRange: { min: 95, max: 100 },
    infusionSeconds: [0, 0, 5, 10, 15, 20, 25]
  },
  {
    teaType: "dark",
    vessel: "gaiwan",
    vesselCapacityMl: 110,
    ratioMlPerGram: 25,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [10, 15, 25, 40, 60]
  },
  {
    teaType: "dark",
    vessel: "zisha_pot",
    vesselCapacityMl: 130,
    ratioMlPerGram: 20,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [12, 18, 28, 45, 65]
  },
  {
    teaType: "dark",
    vessel: "clay_pot",
    vesselCapacityMl: 150,
    ratioMlPerGram: 20,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [15, 20, 30, 50, 70]
  }
];

export function getBrewingGuide(
  teaType: TeaType,
  vessel: Vessel
): BrewingGuide | undefined {
  return brewingGuides.find(
    (guide) => guide.teaType === teaType && guide.vessel === vessel
  );
}
