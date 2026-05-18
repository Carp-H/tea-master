import { describe, expect, it } from "vitest";
import { getRecommendedVessels, teaProfiles } from "../data/teaProfiles";
import { calculateRecipe } from "./calculateRecipe";

describe("tea vessel recommendations", () => {
  it("returns the planned vessel options for every tea type", () => {
    expect(getRecommendedVessels("green")).toEqual(["glass_cup"]);
    expect(getRecommendedVessels("yellow")).toEqual(["glass_cup"]);
    expect(getRecommendedVessels("white")).toEqual(["gaiwan", "porcelain_pot"]);
    expect(getRecommendedVessels("black")).toEqual(["gaiwan", "porcelain_pot"]);
    expect(getRecommendedVessels("oolong")).toEqual(["gaiwan"]);
    expect(getRecommendedVessels("dark")).toEqual(["gaiwan", "zisha_pot", "clay_pot"]);
    expect(getRecommendedVessels("puerh_raw")).toEqual(["gaiwan", "zisha_pot", "clay_pot"]);
    expect(getRecommendedVessels("puerh_ripe")).toEqual(["gaiwan", "zisha_pot", "clay_pot"]);
  });

  it("keeps each tea profile aligned with its vessel recommendations", () => {
    for (const profile of teaProfiles) {
      expect(profile.vessels).toEqual(getRecommendedVessels(profile.id));
    }
  });
});

describe("recipe calculation", () => {
  it("calculates people-scaled values from tea type and selected vessel", () => {
    const recipe = calculateRecipe({
      teaType: "white",
      vessel: "porcelain_pot",
      people: 3
    });

    expect(recipe.waterMl).toBe(450);
    expect(recipe.teaGrams).toBe(7.5);
    expect(recipe.ratioMlPerGram).toBe(60);
    expect(recipe.temperatureC).toBe(90);
    expect(recipe.infusions.map((infusion) => infusion.seconds)).toEqual([
      180, 240, 300
    ]);
  });

  it("updates the numeric recommendation when the vessel changes", () => {
    const gaiwan = calculateRecipe({
      teaType: "dark",
      vessel: "gaiwan",
      people: 2
    });
    const zisha = calculateRecipe({
      teaType: "dark",
      vessel: "zisha_pot",
      people: 2
    });

    expect(gaiwan.waterMl).toBe(220);
    expect(gaiwan.teaGrams).toBe(9);
    expect(gaiwan.rinseSeconds).toBe(10);
    expect(zisha.waterMl).toBe(260);
    expect(zisha.teaGrams).toBe(10.5);
    expect(zisha.ratioMlPerGram).not.toBe(gaiwan.ratioMlPerGram);
  });

  it("does not let language affect recipe calculation", () => {
    const chineseRecipe = calculateRecipe({
      teaType: "oolong",
      vessel: "gaiwan",
      people: 4,
      language: "zh"
    });
    const germanRecipe = calculateRecipe({
      teaType: "oolong",
      vessel: "gaiwan",
      people: 4,
      language: "de"
    });

    expect(germanRecipe).toEqual(chineseRecipe);
  });

  it("rejects a vessel that is not recommended for the tea type", () => {
    expect(() =>
      calculateRecipe({ teaType: "green", vessel: "gaiwan", people: 1 })
    ).toThrow("Vessel gaiwan is not available for tea type green");
  });
});
