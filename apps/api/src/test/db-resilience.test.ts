import { describe, expect, it, vi } from "vitest";
import { withConnectTimeout, withDbRetry } from "../lib/prisma.js";

// Pure helpers: these run even without TEST_DATABASE_URL.
describe("withConnectTimeout", () => {
  it("appends connect_timeout to a URL with query params", () => {
    expect(withConnectTimeout("postgresql://u:p@h/db?sslmode=require")).toBe(
      "postgresql://u:p@h/db?sslmode=require&connect_timeout=15",
    );
  });

  it("starts the query string when there is none", () => {
    expect(withConnectTimeout("postgresql://u:p@h/db")).toBe("postgresql://u:p@h/db?connect_timeout=15");
  });

  it("keeps an explicit connect_timeout", () => {
    const url = "postgresql://u:p@h/db?sslmode=require&connect_timeout=30";
    expect(withConnectTimeout(url)).toBe(url);
  });
});

describe("withDbRetry", () => {
  it("retries until the database answers", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("P1001")).mockResolvedValue("ok");
    await expect(withDbRetry(fn, { attempts: 3, delayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("gives up after the last attempt", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("P1001"));
    await expect(withDbRetry(fn, { attempts: 3, delayMs: 1 })).rejects.toThrow("P1001");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
