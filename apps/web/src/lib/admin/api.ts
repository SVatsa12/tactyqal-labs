import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_URL, pageMetaSchema, postSchema, postSummarySchema, termWithCountSchema } from "@/lib/api";
import { getToken } from "./session";

export type ApiError = {
  code: string;
  message: string;
  details?: { path: string; message: string }[] | unknown;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: ApiError };

const errorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
});

/**
 * Authenticated call to the API. A 401 means the session expired: go to login.
 * Never cached — admin views must be fresh.
 */
export async function adminFetch<S extends z.ZodType>(
  path: string,
  schema: S,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<z.infer<S>>> {
  const token = await getToken();
  if (!token) redirect("/admin/login");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return {
      ok: false,
      status: 503,
      error: { code: "UNAVAILABLE", message: "Can't reach the API. Is it running?" },
    };
  }

  // Expired/invalid token: the logout route clears the cookie (components can't), then shows login.
  if (res.status === 401) redirect("/admin/logout?expired=1");
  if (res.status === 204) return { ok: true, data: undefined as z.infer<S> };

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = errorSchema.safeParse(json);
    return {
      ok: false,
      status: res.status,
      error: parsed.success ? parsed.data.error : { code: "UNKNOWN", message: `Request failed (${res.status})` },
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, status: 500, error: { code: "BAD_RESPONSE", message: "Unexpected response from the API" } };
  }
  return { ok: true, data: parsed.data };
}

// ---------------------------------------------------------------- typed helpers

export const adminSchemas = {
  me: z.object({
    data: z.object({ id: z.string(), email: z.string(), name: z.string(), role: z.enum(["ADMIN", "EDITOR"]) }),
  }),
  postList: z.object({ data: z.array(postSummarySchema), meta: pageMetaSchema }),
  post: z.object({ data: postSchema }),
  terms: z.object({ data: z.array(termWithCountSchema) }),
  term: z.object({ data: termWithCountSchema }),
  leadList: z.object({
    data: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        phone: z.string().nullable(),
        message: z.string(),
        createdAt: z.string(),
      }),
    ),
    meta: pageMetaSchema,
  }),
  none: z.unknown(),
};
