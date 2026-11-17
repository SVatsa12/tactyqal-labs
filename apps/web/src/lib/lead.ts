import { z } from "zod";
import { site } from "@/content/site";

const e = site.contact.form.errors;

/** Mirrors createLeadSchema in apps/api, with friendlier messages. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, e.nameShort).max(80, e.nameLong),
  email: z.string().trim().email(e.email).max(254, e.email),
  phone: z
    .string()
    .trim()
    .max(30, e.phone)
    .regex(/^[+\d\s()-]*$/, e.phone),
  message: z.string().trim().min(10, e.messageShort).max(2000, e.messageLong),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadField = keyof LeadInput;
export type LeadErrors = Partial<Record<LeadField, string>>;

/** Turn Zod issues into one message per field. */
export function fieldErrors(error: z.ZodError): LeadErrors {
  const out: LeadErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && key in leadSchema.shape && !out[key as LeadField]) {
      out[key as LeadField] = issue.message;
    }
  }
  return out;
}

const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});

export type SubmitResult = { ok: true } | { ok: false; message?: string; fields?: LeadErrors };

/**
 * Sent from the browser straight to the API, so the API's per-IP rate limit
 * applies to each visitor rather than to the Next.js server.
 */
export async function submitLead(input: LeadInput): Promise<SubmitResult> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  let res: Response;
  try {
    res = await fetch(`${base}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, phone: input.phone || null }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { ok: false };
  }
  if (res.ok) return { ok: true };

  const parsed = apiErrorSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success) return { ok: false };
  const { code, message, details } = parsed.data.error;
  if (code === "VALIDATION_ERROR" && details) {
    const fields: LeadErrors = {};
    for (const d of details) {
      if (d.path in leadSchema.shape) fields[d.path as LeadField] ??= d.message;
    }
    return { ok: false, fields };
  }
  return { ok: false, message: code === "RATE_LIMITED" ? message : undefined };
}
