import { afterAll, describe, expect, it } from "vitest";
import { api, hasTestDb, prisma } from "./helpers.js";

describe.skipIf(!hasTestDb)("health", () => {
  afterAll(() => prisma.$disconnect());

  it("reports ok when the database answers", async () => {
    const res = await api().get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });

  it("returns the standard error shape for unknown routes", async () => {
    const res = await api().get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Route GET /api/v1/nope not found" } });
  });
});
