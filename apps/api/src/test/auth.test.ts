import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN, api, bearer, createAdmin, hasTestDb, prisma, resetDb } from "./helpers.js";

// The login limiter allows 10 attempts per 15 minutes per IP. Each test file gets fresh
// modules, so the count starts at 0 here; these tests run in order and share it.
const LOGIN_LIMIT = 10;

describe.skipIf(!hasTestDb)("auth", () => {
  let attempts = 0;
  const login = (email: string, password: string) => {
    attempts++;
    return api().post("/api/v1/auth/login").send({ email, password });
  };

  beforeAll(async () => {
    await resetDb();
    await createAdmin();
  });
  afterAll(() => prisma.$disconnect());

  it("logs in with the right password and the token works", async () => {
    const res = await login(ADMIN.email.toUpperCase(), ADMIN.password); // emails are case-insensitive
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ email: ADMIN.email, name: ADMIN.name, role: "ADMIN" });
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
    expect(typeof res.body.data.token).toBe("string");

    const me = await api().get("/api/v1/auth/me").set(bearer(res.body.data.token));
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(ADMIN.email);
  });

  it("rejects a wrong password and an unknown email with the same 401", async () => {
    const wrong = await login(ADMIN.email, "not-the-password");
    const unknown = await login("nobody@test.local", "whatever-password");
    for (const res of [wrong, unknown]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: "Invalid email or password" } });
    }
  });

  it("rejects requests with a missing or forged token", async () => {
    expect((await api().get("/api/v1/auth/me")).status).toBe(401);
    const forged = await api().get("/api/v1/auth/me").set(bearer("eyJhbGciOiJIUzI1NiJ9.e30.invalid"));
    expect(forged.status).toBe(401);
    expect(forged.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rate-limits repeated login attempts", async () => {
    while (attempts < LOGIN_LIMIT) {
      const res = await login(ADMIN.email, "still-wrong");
      expect(res.status).toBe(401);
    }
    const blocked = await login(ADMIN.email, ADMIN.password); // even the right password is blocked now
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
    expect(blocked.headers).toHaveProperty("retry-after");
  });
});
