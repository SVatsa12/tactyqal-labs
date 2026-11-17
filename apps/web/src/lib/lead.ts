import { site } from "@/content/site";
import { PUBLIC_API_URL } from "@/lib/urls";

/*
 * Client-side checks for the contact form. Hand-written (no Zod) to keep the homepage bundle
 * small; they mirror createLeadSchema in apps/api, which still validates every request with Zod.
 * Anything the API rejects is mapped back onto the fields by submitLead().
 */

export type LeadInput = { name: string; email: string; phone: string; message: string };
export type LeadField = keyof LeadInput;
export type LeadErrors = Partial<Record<LeadField, string>>;

export const LEAD_FIELDS: readonly LeadField[] = ["name", "email", "phone", "message"];

const e = site.contact.form.errors;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d\s()-]*$/;

const isField = (key: string): key is LeadField => (LEAD_FIELDS as readonly string[]).includes(key);

/** Validates raw form values; returns trimmed values or one message per invalid field. */
export function validateLead(
  raw: Record<string, unknown>,
): { ok: true; data: LeadInput } | { ok: false; errors: LeadErrors } {
  const value = (k: LeadField) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const data: LeadInput = {
    name: value("name"),
    email: value("email"),
    phone: value("phone"),
    message: value("message"),
  };

  const errors: LeadErrors = {};
  if (data.name.length < 2) errors.name = e.nameShort;
  else if (data.name.length > 80) errors.name = e.nameLong;

  if (!EMAIL.test(data.email) || data.email.length > 254) errors.email = e.email;

  if (data.phone.length > 30 || !PHONE.test(data.phone)) errors.phone = e.phone;

  if (data.message.length < 10) errors.message = e.messageShort;
  else if (data.message.length > 2000) errors.message = e.messageLong;

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}

export type SubmitResult = { ok: true } | { ok: false; message?: string; fields?: LeadErrors };

type ApiError = { code: string; message: string; details?: { path: string; message: string }[] };

/** Reads `{ error: { code, message, details? } }` without a schema library. */
function readApiError(json: unknown): ApiError | null {
  if (typeof json !== "object" || json === null || !("error" in json)) return null;
  const err = (json as { error: unknown }).error;
  if (typeof err !== "object" || err === null) return null;
  const { code, message, details } = err as Record<string, unknown>;
  if (typeof code !== "string" || typeof message !== "string") return null;
  const list = Array.isArray(details)
    ? details.filter(
        (d): d is { path: string; message: string } =>
          typeof d === "object" && d !== null && typeof d.path === "string" && typeof d.message === "string",
      )
    : undefined;
  return { code, message, details: list };
}

/**
 * Sent from the browser straight to the API, so the API's per-IP rate limit
 * applies to each visitor rather than to the Next.js server.
 */
export async function submitLead(input: LeadInput): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch(`${PUBLIC_API_URL}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, phone: input.phone || null }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { ok: false };
  }
  if (res.ok) return { ok: true };

  const error = readApiError(await res.json().catch(() => null));
  if (!error) return { ok: false };
  if (error.code === "VALIDATION_ERROR" && error.details) {
    const fields: LeadErrors = {};
    for (const d of error.details) if (isField(d.path)) fields[d.path] ??= d.message;
    return { ok: false, fields };
  }
  return { ok: false, message: error.code === "RATE_LIMITED" ? error.message : undefined };
}
