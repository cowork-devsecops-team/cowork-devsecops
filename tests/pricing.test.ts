import { computePriceCents } from "../src/services/pricing";

describe("calcul du prix cote serveur", () => {
  const start = new Date("2026-11-10T09:00:00Z");

  it("2 heures a 5000 centimes/h = 10000", () => {
    expect(computePriceCents(5000, start, new Date("2026-11-10T11:00:00Z"))).toBe(10000);
  });

  it("arrondit a l'heure superieure", () => {
    expect(computePriceCents(5000, start, new Date("2026-11-10T09:30:00Z"))).toBe(5000);
  });

  it("refuse un creneau de duree nulle ou negative", () => {
    expect(() => computePriceCents(5000, start, start)).toThrow();
    expect(() => computePriceCents(5000, start, new Date("2026-11-10T08:00:00Z"))).toThrow();
  });
});
