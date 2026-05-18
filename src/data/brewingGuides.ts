import type { BrewingGuide, TeaType, Vessel } from "../types";

export const brewingGuides: BrewingGuide[] = [
  {
    teaType: "green",
    vessel: "glass_cup",
    waterPerPersonMl: 250,
    ratioMlPerGram: 50,
    temperatureC: 80,
    infusionSeconds: [120, 150, 180]
  },
  {
    teaType: "yellow",
    vessel: "glass_cup",
    waterPerPersonMl: 250,
    ratioMlPerGram: 50,
    temperatureC: 85,
    infusionSeconds: [150, 180, 240]
  },
  {
    teaType: "white",
    vessel: "gaiwan",
    waterPerPersonMl: 110,
    ratioMlPerGram: 35,
    temperatureC: 90,
    infusionSeconds: [25, 30, 40, 55, 75]
  },
  {
    teaType: "white",
    vessel: "porcelain_pot",
    waterPerPersonMl: 150,
    ratioMlPerGram: 60,
    temperatureC: 90,
    infusionSeconds: [180, 240, 300]
  },
  {
    teaType: "black",
    vessel: "gaiwan",
    waterPerPersonMl: 110,
    ratioMlPerGram: 30,
    temperatureC: 90,
    infusionSeconds: [10, 15, 20, 30, 45]
  },
  {
    teaType: "black",
    vessel: "porcelain_pot",
    waterPerPersonMl: 180,
    ratioMlPerGram: 50,
    temperatureC: 90,
    infusionSeconds: [120, 180, 240]
  },
  {
    teaType: "oolong",
    vessel: "gaiwan",
    waterPerPersonMl: 110,
    ratioMlPerGram: 18,
    temperatureC: 95,
    rinseSeconds: 5,
    infusionSeconds: [10, 15, 20, 30, 45, 60]
  },
  {
    teaType: "dark",
    vessel: "gaiwan",
    waterPerPersonMl: 110,
    ratioMlPerGram: 24,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [10, 15, 25, 40, 60]
  },
  {
    teaType: "dark",
    vessel: "zisha_pot",
    waterPerPersonMl: 130,
    ratioMlPerGram: 25,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [12, 18, 28, 45, 65]
  },
  {
    teaType: "dark",
    vessel: "clay_pot",
    waterPerPersonMl: 150,
    ratioMlPerGram: 30,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [15, 20, 30, 50, 70]
  },
  {
    teaType: "puerh_raw",
    vessel: "gaiwan",
    waterPerPersonMl: 110,
    ratioMlPerGram: 22,
    temperatureC: 95,
    rinseSeconds: 5,
    infusionSeconds: [8, 12, 18, 25, 40, 60]
  },
  {
    teaType: "puerh_raw",
    vessel: "zisha_pot",
    waterPerPersonMl: 130,
    ratioMlPerGram: 24,
    temperatureC: 95,
    rinseSeconds: 5,
    infusionSeconds: [10, 15, 22, 32, 48, 68]
  },
  {
    teaType: "puerh_raw",
    vessel: "clay_pot",
    waterPerPersonMl: 150,
    ratioMlPerGram: 28,
    temperatureC: 95,
    rinseSeconds: 5,
    infusionSeconds: [12, 18, 26, 38, 55, 75]
  },
  {
    teaType: "puerh_ripe",
    vessel: "gaiwan",
    waterPerPersonMl: 110,
    ratioMlPerGram: 25,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [8, 12, 18, 25, 40, 60]
  },
  {
    teaType: "puerh_ripe",
    vessel: "zisha_pot",
    waterPerPersonMl: 130,
    ratioMlPerGram: 26,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [10, 15, 22, 32, 48, 68]
  },
  {
    teaType: "puerh_ripe",
    vessel: "clay_pot",
    waterPerPersonMl: 150,
    ratioMlPerGram: 30,
    temperatureC: 100,
    rinseSeconds: 10,
    infusionSeconds: [12, 18, 28, 42, 60, 80]
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
