import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { api, bearer, createAdmin, hasTestDb, prisma, resetDb } from "./helpers.js";

// The lead limiter allows 5 submissions per 15 minutes per IP (fresh modules per test file).
const LEAD_LIMIT = 5;

describe.skipIf(!hasTestDb)("leads", () => {
  let token = "";
  let submissions = 0;
  const submit = (body: Record<string, unknown>) => {
    submissions++;
    return api().post("/api/v1/leads").send(body);
  };
  const valid = {
    name: "  Asha Parent ",
    email: "Asha@Example.COM",
    phone: "+91 98765 43210",
    message: "My daughter wants to build an app for her school.",
  };

  beforeAll(async () => {
    await resetDb();
    token = (await createAdmin()).token;
  });
  afterAll(() => prisma.$disconnect());

  it("accepts a valid lead without auth and returns only id + createdAt", async () => {
    const res = await submit(valid);
    expect(res.status).toBe(201);
    expect(Object.keys(res.body.data).sort()).toEqual(["createdAt", "id"]);

    const row = await prisma.lead.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(row).toMatchObject({ name: "Asha Parent", email: "asha@example.com", phone: "+91 98765 43210" });
  });

  it("stores an empty phone as null", async () => {
    const res = await submit({ ...valid, email: "second@example.com", phone: "" });
    expect(res.status).toBe(201);
    const row = await prisma.lead.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(row.phone).toBeNull();
  });

  it("validates every field", async () => {
    const res = await submit({ name: "A", email: "not-an-email", phone: "call me", message: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const details = res.body.error.details as { path: string; message: string }[];
    expect(Object.fromEntries(details.map((d) => [d.path, d.message]))).toEqual({
      name: "Name must be at least 2 characters",
      email: "Enter a valid email address",
      phone: "Use digits, spaces, +, - or brackets only",
      message: "Message must be at least 10 characters",
    });
  });

  it("lists leads for the admin only, newest first, paginated", async () => {
    expect((await api().get("/api/v1/leads")).status).toBe(401);

    const res = await api().get("/api/v1/leads?limit=1").set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ email: "second@example.com", phone: null });

    const page2 = await api().get("/api/v1/leads?limit=1&page=2").set(bearer(token));
    expect(page2.body.data[0].email).toBe("asha@example.com");
  });

  it("rate-limits submissions per IP", async () => {
    while (submissions < LEAD_LIMIT) {
      expect((await submit({ ...valid, email: `n${submissions}@example.com` })).status).toBe(201);
    }
    const blocked = await submit(valid);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
    expect(await prisma.lead.count()).toBe(LEAD_LIMIT - 1); // the invalid one was counted but not stored
  });
});
