import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("securite de base de l'API", () => {
  it("GET /health repond 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("ne revele pas la technologie (x-powered-by absent)", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("envoie les en-tetes de securite Helmet", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["strict-transport-security"]).toBeDefined();
  });

  it("n'autorise pas une origine inconnue (CORS)", async () => {
    const res = await request(app).get("/health").set("Origin", "http://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("route inconnue : 404 JSON sans stack trace", async () => {
    const res = await request(app).get("/nimporte-quoi");
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\(.*\)/);
  });
});
