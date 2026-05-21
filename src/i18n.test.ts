import { describe, expect, it } from "vitest";
import { copies } from "./i18n";

describe("English copy", () => {
  it("uses one timer drinking prompt wherever English tells users the tea is ready", () => {
    const englishTimerText = [
      copies.en.readyToSip,
      copies.en.immediateSipDetail
    ].join(" ");

    expect(copies.en.readyToSip).toBe("take a sip!");
    expect(copies.en.immediateSipDetail).toBe("take a sip!");
    expect(englishTimerText).not.toMatch(/sip slowly|sip right away/i);
  });
});

describe("Green tea refill copy", () => {
  it("directly names the previous infusion remaining at about one third", () => {
    expect(copies.zh.greenRefillInfusionDetail).toContain(
      "前一泡茶水还剩大约三分之一"
    );
    expect(copies.zh.greenOptionalInfusionDetail).toContain(
      "前一泡茶水还剩大约三分之一"
    );
    expect(copies.en.greenRefillInfusionDetail).toContain(
      "the previous infusion has about one third"
    );
    expect(copies.en.greenOptionalInfusionDetail).toContain(
      "the previous infusion has about one third"
    );
    expect(copies.de.greenRefillInfusionDetail).toContain(
      "vom vorherigen Aufguss noch etwa ein Drittel"
    );
    expect(copies.de.greenOptionalInfusionDetail).toContain(
      "vom vorherigen Aufguss noch etwa ein Drittel"
    );
  });
});

describe("German copy", () => {
  it("uses proper German diacritics instead of ASCII fallbacks", () => {
    const germanText = JSON.stringify(copies.de);

    expect(copies.de.teaNames.green).toBe("Grüntee");
    expect(copies.de.teaNames.white).toBe("Weißer Tee");
    expect(copies.de.subtitle).toBe(
      "Es gibt keinen schlechten Tee, nur falsche Zubereitung."
    );
    expect(copies.de.slogan).toBe("Tee und Zen - ein Geschmack");
    expect(copies.de.readyToSip).toBe(
      "Ihr Tee ist fertig. Genießen Sie ihn in Ruhe."
    );

    expect(germanText).toContain("Gefäß");
    expect(germanText).toContain("Verhältnis");
    expect(germanText).toContain("Blätter");
    expect(germanText).toContain("Zurücksetzen");
    expect(germanText).not.toMatch(
      /Grun|Gefass|wahlen|bruhen|Verhaltnis|vorwarmen|einfullen|aufgiessen|abgiessen|Blatter|Lauft|Geniessen|Nachsten|Zuruck|Aufgusse|verlangern|Weisser/
    );
  });
});
