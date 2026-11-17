import { describe, expect, it } from "vitest";
import { api } from "./helpers.js";

// No database needed: these routes are static. Guards the Vercel-safe docs setup (no express.static).
describe("API docs", () => {
  it("serves the Swagger UI page with its own CSP allowing the pinned CDN build", async () => {
    const res = await api().get("/api/docs");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("swagger-ui-dist@");
    expect(res.headers["content-security-policy"]).toContain("script-src 'self' https://cdn.jsdelivr.net");
  });

  it("serves the init script same-origin (no inline script)", async () => {
    const res = await api().get("/api/docs/init.js");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("javascript");
    expect(res.text).toContain('url: "/api/openapi.json"');
  });

  it("serves the OpenAPI spec", async () => {
    const res = await api().get("/api/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
  });
});
