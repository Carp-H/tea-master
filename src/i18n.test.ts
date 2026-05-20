import { describe, expect, it } from "vitest";
import { copies } from "./i18n";

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
