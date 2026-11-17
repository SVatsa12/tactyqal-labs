"use client";

import * as React from "react";
import { useActionState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { savePostAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, inputCls, textareaCls } from "@/components/ui/field";
import { CoverPreview } from "./cover-preview";
import { FlashToast } from "./flash-toast";
import { RichTextEditor } from "./rich-text-editor";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null; // ISO
  seoTitle: string;
  seoDescription: string;
  categoryIds: string[];
  tagIds: string[];
};

type Term = { id: string; name: string };

/** ISO -> value for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function PostForm({
  initial,
  categories,
  tags,
  created,
}: {
  initial: PostFormValues;
  categories: Term[];
  tags: Term[];
  created?: boolean;
}) {
  // Toast from the action itself: a successful save re-keys this form (new updatedAt),
  // so an effect watching `state` would unmount before it ran.
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await savePostAction(prev, formData);
    if (result.ok) toast.success("Changes saved");
    else if (result.error) toast.error("Couldn't save the post", { description: result.error });
    return result;
  }, {});
  const [status, setStatus] = React.useState(initial.status);
  const [tzOffset, setTzOffset] = React.useState(0);
  const [publishedLocal, setPublishedLocal] = React.useState("");
  const [cover, setCover] = React.useState(initial.coverImageUrl);

  // Timezone-dependent values are only known in the browser.
  React.useEffect(() => {
    setTzOffset(new Date().getTimezoneOffset());
    setPublishedLocal(toLocalInput(initial.publishedAt));
  }, [initial.publishedAt]);

  const fe = state.fieldErrors ?? {};
  const err = (k: string) => fe[k];
  const isEdit = Boolean(initial.id);

  return (
    <form action={action} className="grid gap-8 xl:grid-cols-[1fr_20rem]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="tzOffset" value={tzOffset} />

      {/* Main column */}
      <div className="min-w-0 space-y-6">
        {state.error ? (
          <p role="alert" className="rounded-xl border border-brand/40 bg-brand-soft px-4 py-3 text-sm font-medium">
            {state.error}
          </p>
        ) : null}
        {created ? <FlashToast param="created" message="Post created" /> : null}

        <Field label="Title" htmlFor="title" error={err("title")}>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={initial.title}
            aria-invalid={Boolean(err("title"))}
            className={`${inputCls} h-13 font-display text-xl font-semibold tracking-tight`}
          />
        </Field>

        <div className="space-y-1.5">
          <span id="content-label" className="block text-sm font-semibold">
            Content
          </span>
          <RichTextEditor name="content" initialHtml={initial.content} labelId="content-label" />
          {err("content") ? <p className="text-sm font-medium text-brand-ink">{err("content")}</p> : null}
        </div>

        <Field
          label="Excerpt"
          htmlFor="excerpt"
          hint="Shown on cards and in search results. Leave empty to generate it from the content."
          error={err("excerpt")}
        >
          <textarea id="excerpt" name="excerpt" rows={3} maxLength={500} defaultValue={initial.excerpt} className={textareaCls} />
        </Field>

        <fieldset className="card space-y-5 p-5">
          <legend className="px-1 text-sm font-semibold">SEO</legend>
          <Field label="SEO title" htmlFor="seoTitle" hint="Defaults to the post title." error={err("seoTitle")}>
            <input id="seoTitle" name="seoTitle" maxLength={200} defaultValue={initial.seoTitle} className={inputCls} />
          </Field>
          <Field label="Meta description" htmlFor="seoDescription" hint="Defaults to the excerpt." error={err("seoDescription")}>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              maxLength={320}
              defaultValue={initial.seoDescription}
              className={textareaCls}
            />
          </Field>
        </fieldset>
      </div>

      {/* Sidebar */}
      <div className="space-y-5 xl:sticky xl:top-8 xl:self-start">
        <div className="card space-y-5 p-5">
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")}
              className={inputCls}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>

          <Field
            label="Publish date"
            htmlFor="publishedAt"
            hint={status === "PUBLISHED" ? "Empty = now. A future date schedules it." : "Used when you publish."}
            error={err("publishedAt")}
          >
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              value={publishedLocal}
              onChange={(e) => setPublishedLocal(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : status === "PUBLISHED" ? "Publish" : "Save draft"}
          </Button>

          {isEdit && initial.status === "PUBLISHED" ? (
            <a
              href={`/blog/${initial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline underline-offset-4"
            >
              View post <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>

        <div className="card space-y-5 p-5">
          <Field label="URL slug" htmlFor="slug" hint={isEdit ? undefined : "Leave empty to generate from the title."} error={err("slug")}>
            <div className="flex items-center rounded-xl border border-border bg-surface focus-within:border-ink/40">
              <span className="pl-3.5 text-sm text-muted">/blog/</span>
              <input
                id="slug"
                name="slug"
                defaultValue={initial.slug}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                aria-invalid={Boolean(err("slug"))}
                className="h-11 w-full min-w-0 rounded-r-xl bg-transparent pr-3.5 text-[0.9375rem] focus-visible:outline-none"
              />
            </div>
          </Field>

          <Field label="Cover image URL" htmlFor="coverImageUrl" error={err("coverImageUrl")}>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              placeholder="https://…"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              aria-invalid={Boolean(err("coverImageUrl"))}
              className={inputCls}
            />
          </Field>
          <CoverPreview url={cover.trim()} />
        </div>

        <TermPicker legend="Categories" name="categoryIds" terms={categories} selected={initial.categoryIds} />
        <TermPicker legend="Tags" name="tagIds" terms={tags} selected={initial.tagIds} />
      </div>
    </form>
  );
}

function TermPicker({ legend, name, terms, selected }: { legend: string; name: string; terms: Term[]; selected: string[] }) {
  return (
    <fieldset className="card p-5">
      <legend className="px-1 text-sm font-semibold">{legend}</legend>
      {terms.length === 0 ? (
        <p className="text-sm text-muted">
          None yet. <a href="/admin/taxonomy" className="font-semibold text-brand-ink underline underline-offset-4">Add some</a>
        </p>
      ) : (
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {terms.map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-bg">
              <input
                type="checkbox"
                name={name}
                value={t.id}
                defaultChecked={selected.includes(t.id)}
                className="size-4 accent-[var(--brand)]"
              />
              {t.name}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
