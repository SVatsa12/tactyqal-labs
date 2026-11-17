"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_URL } from "@/lib/api";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { clearToken, setToken } from "@/lib/admin/session";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function refreshPublic(slug?: string) {
  revalidateTag("posts");
  revalidatePath("/");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function toFieldErrors(details: unknown): Record<string, string> | undefined {
  const parsed = z.array(z.object({ path: z.string(), message: z.string() })).safeParse(details);
  if (!parsed.success) return undefined;
  return Object.fromEntries(parsed.data.map((d) => [d.path || "form", d.message]));
}

/** Only allow same-site relative redirects after login. */
function safeNext(next: FormDataEntryValue | null): string {
  const v = typeof next === "string" ? next : "";
  return v.startsWith("/admin") && !v.startsWith("//") ? v : "/admin";
}

// ---------------------------------------------------------------- auth

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { error: "Can't reach the API. Is it running?" };
  }

  const json: unknown = await res.json().catch(() => null);
  const ok = z.object({ data: z.object({ token: z.string() }) }).safeParse(json);
  if (!res.ok || !ok.success) {
    const err = z.object({ error: z.object({ message: z.string() }) }).safeParse(json);
    return { error: err.success ? err.data.error.message : "Sign in failed." };
  }

  await setToken(ok.data.data.token);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await clearToken();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- posts

const optional = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

export async function savePostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = optional(formData.get("id"));
  const publishedAtLocal = optional(formData.get("publishedAt"));
  const tzOffset = Number(formData.get("tzOffset") ?? 0); // minutes, from the browser

  // datetime-local has no timezone; convert using the editor's offset.
  let publishedAt: string | null = null;
  if (publishedAtLocal) {
    const asUtc = new Date(`${publishedAtLocal}:00Z`).getTime();
    if (!Number.isNaN(asUtc)) publishedAt = new Date(asUtc + tzOffset * 60_000).toISOString();
  }

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: optional(formData.get("slug")) ?? undefined,
    excerpt: optional(formData.get("excerpt")),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: optional(formData.get("coverImageUrl")),
    status: formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    publishedAt,
    seoTitle: optional(formData.get("seoTitle")),
    seoDescription: optional(formData.get("seoDescription")),
    categoryIds: formData.getAll("categoryIds").map(String),
    tagIds: formData.getAll("tagIds").map(String),
  };

  if (!payload.title) return { fieldErrors: { title: "Title is required" } };

  const res = id
    ? await adminFetch(`/posts/${encodeURIComponent(id)}`, adminSchemas.post, { method: "PATCH", body: payload })
    : await adminFetch("/posts", adminSchemas.post, { method: "POST", body: payload });

  if (!res.ok) {
    return { error: res.error.message, fieldErrors: toFieldErrors(res.error.details) };
  }

  refreshPublic(res.data.data.slug);
  if (!id) redirect(`/admin/posts/${res.data.data.id}?created=1`);
  revalidatePath(`/admin/posts/${id}`);
  return { ok: true };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await adminFetch(`/posts/${encodeURIComponent(id)}`, adminSchemas.none, { method: "DELETE" });
  refreshPublic();
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}

// ---------------------------------------------------------------- taxonomy

const kindSchema = z.enum(["categories", "tags"]);

export async function createTermAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const kind = kindSchema.safeParse(formData.get("kind"));
  const name = String(formData.get("name") ?? "").trim();
  if (!kind.success) return { error: "Unknown type" };
  if (!name) return { fieldErrors: { name: "Name is required" } };

  const res = await adminFetch(`/${kind.data}`, adminSchemas.term, { method: "POST", body: { name } });
  if (!res.ok) return { error: res.error.message, fieldErrors: toFieldErrors(res.error.details) };

  revalidatePath("/admin/taxonomy");
  refreshPublic();
  return { ok: true };
}

export async function deleteTermAction(formData: FormData): Promise<void> {
  const kind = kindSchema.safeParse(formData.get("kind"));
  const id = String(formData.get("id") ?? "");
  if (!kind.success || !id) return;
  await adminFetch(`/${kind.data}/${encodeURIComponent(id)}`, adminSchemas.none, { method: "DELETE" });
  revalidatePath("/admin/taxonomy");
  refreshPublic();
}
