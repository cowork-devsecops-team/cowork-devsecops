import { InMemoryScanStore, signQr, verifyQr } from "../src/services/qr";

const KEY = "test-only-key-test-only-key-test-only-key";
const NOW = 1_800_000_000;
const slot = { bid: "booking-1", nbf: NOW, exp: NOW + 3600 };

describe("QR signe", () => {
  it("accepte un QR valide dans son creneau", () => {
    const res = verifyQr(signQr(slot, KEY), KEY, NOW + 10);
    expect(res.ok).toBe(true);
  });

  it("refuse un QR falsifie (payload modifie)", () => {
    const [, sig] = signQr(slot, KEY).split(".");
    const forgedBody = Buffer.from(JSON.stringify({ jti: "x", bid: "booking-2", nbf: NOW, exp: NOW + 3600 })).toString("base64url");
    const res = verifyQr(`${forgedBody}.${sig}`, KEY, NOW + 10);
    expect(res).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("refuse un QR signe avec une autre cle", () => {
    const res = verifyQr(signQr(slot, "autre-cle-autre-cle-autre-cle-autre-cle"), KEY, NOW + 10);
    expect(res).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("refuse un QR avant le creneau", () => {
    expect(verifyQr(signQr(slot, KEY), KEY, NOW - 1)).toEqual({ ok: false, reason: "not_yet_valid" });
  });

  it("refuse un QR apres le creneau", () => {
    expect(verifyQr(signQr(slot, KEY), KEY, NOW + 3601)).toEqual({ ok: false, reason: "expired" });
  });

  it("refuse un jeton mal forme", () => {
    expect(verifyQr("n-importe-quoi", KEY, NOW)).toEqual({ ok: false, reason: "malformed" });
  });

  it("refuse le rejeu : le meme jeton ne passe qu'une fois", async () => {
    const store = new InMemoryScanStore();
    const res = verifyQr(signQr(slot, KEY), KEY, NOW + 10);
    if (!res.ok) throw new Error("QR devrait etre valide");
    expect(await store.markUsed(res.payload.jti)).toBe(true);
    expect(await store.markUsed(res.payload.jti)).toBe(false);
  });
});
