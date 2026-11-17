import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { api, bearer, createAdmin, hasTestDb, prisma, resetDb } from "./helpers.js";

const DAY = 24 * 60 * 60 * 1000;

describe.skipIf(!hasTestDb)("posts", () => {
  let token = "";
  const asAdmin = () => bearer(token);
  const create = (body: Record<string, unknown>) => api().post("/api/v1/posts").set(asAdmin()).send(body);

  beforeAll(async () => {
    await resetDb();
    token = (await createAdmin()).token;
  });
  beforeEach(async () => {
    await prisma.post.deleteMany();
  });
  afterAll(() => prisma.$disconnect());

  describe("CRUD as admin", () => {
    it("creates, reads, updates and deletes a post", async () => {
      const created = await create({
        title: "My First Post!",
        content: "<h2>Hello</h2><p>Some words for the reading time.</p>",
        status: "DRAFT",
      });
      expect(created.status).toBe(201);
      const post = created.body.data;
      expect(post).toMatchObject({
        title: "My First Post!",
        slug: "my-first-post",
        status: "DRAFT",
        publishedAt: null,
        excerpt: "Hello Some words for the reading time.",
        readingTimeMinutes: 1,
        author: { name: "Test Admin" },
      });
      expect(created.headers.location).toBe(`/api/v1/posts/${post.id}`);

      const byId = await api().get(`/api/v1/posts/${post.id}`).set(asAdmin());
      const bySlug = await api().get("/api/v1/posts/my-first-post").set(asAdmin());
      expect(byId.status).toBe(200);
      expect(bySlug.body.data.id).toBe(post.id);

      const updated = await api()
        .patch(`/api/v1/posts/${post.id}`)
        .set(asAdmin())
        .send({ title: "Renamed", status: "PUBLISHED" });
      expect(updated.status).toBe(200);
      expect(updated.body.data).toMatchObject({ title: "Renamed", slug: "my-first-post", status: "PUBLISHED" });
      expect(updated.body.data.publishedAt).not.toBeNull(); // stamped on first publish

      const list = await api().get("/api/v1/posts?status=all").set(asAdmin());
      expect(list.status).toBe(200);
      expect(list.body.meta).toMatchObject({ page: 1, total: 1, totalPages: 1 });
      expect(list.body.data.map((p: { id: string }) => p.id)).toEqual([post.id]);

      const removed = await api().delete(`/api/v1/posts/${post.id}`).set(asAdmin());
      expect(removed.status).toBe(204);
      expect((await api().get(`/api/v1/posts/${post.id}`).set(asAdmin())).status).toBe(404);
      expect((await api().delete(`/api/v1/posts/${post.id}`).set(asAdmin())).status).toBe(404);
    });

    it("requires a token to write", async () => {
      const res = await api().post("/api/v1/posts").send({ title: "Sneaky" });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
      expect(await prisma.post.count()).toBe(0);
    });
  });

  describe("public visibility", () => {
    it("hides drafts and future-scheduled posts from the public", async () => {
      await create({ title: "Live post", status: "PUBLISHED" });
      await create({ title: "Draft post", status: "DRAFT" });
      await create({ title: "Scheduled post", status: "PUBLISHED", publishedAt: new Date(Date.now() + 7 * DAY) });

      const pub = await api().get("/api/v1/posts");
      expect(pub.status).toBe(200);
      expect(pub.body.data.map((p: { slug: string }) => p.slug)).toEqual(["live-post"]);
      expect(pub.body.meta.total).toBe(1);

      // Asking for other statuses without a token changes nothing.
      for (const status of ["draft", "all"]) {
        const res = await api().get(`/api/v1/posts?status=${status}`);
        expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual(["live-post"]);
      }

      expect((await api().get("/api/v1/posts/live-post")).status).toBe(200);
      expect((await api().get("/api/v1/posts/draft-post")).status).toBe(404);
      expect((await api().get("/api/v1/posts/scheduled-post")).status).toBe(404);

      // The admin still sees all three.
      const admin = await api().get("/api/v1/posts?status=all").set(asAdmin());
      expect(admin.body.meta.total).toBe(3);
      expect((await api().get("/api/v1/posts/draft-post").set(asAdmin())).status).toBe(200);
    });

    it("shows a scheduled post once its date has passed", async () => {
      await create({ title: "Was scheduled", status: "PUBLISHED", publishedAt: new Date(Date.now() - 1000) });
      expect((await api().get("/api/v1/posts/was-scheduled")).status).toBe(200);
    });
  });

  describe("validation", () => {
    it("returns VALIDATION_ERROR with per-field details", async () => {
      const res = await create({ title: "", coverImageUrl: "javascript:alert(1)", status: "LIVE" });
      expect(res.status).toBe(400);
      expect(Object.keys(res.body)).toEqual(["error"]);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", message: "Invalid request body" });
      const details = res.body.error.details as { path: string; message: string }[];
      expect(details.map((d) => d.path).sort()).toEqual(["coverImageUrl", "status", "title"]);
      for (const d of details) expect(typeof d.message).toBe("string");
    });

    it("rejects bad query params and malformed JSON with the same shape", async () => {
      const q = await api().get("/api/v1/posts?limit=1000");
      expect(q.status).toBe(400);
      expect(q.body.error).toMatchObject({ code: "VALIDATION_ERROR", message: "Invalid request query" });
      expect(q.body.error.details[0].path).toBe("limit");

      const json = await api()
        .post("/api/v1/posts")
        .set(asAdmin())
        .set("Content-Type", "application/json")
        .send('{"title": ');
      expect(json.status).toBe(400);
      expect(json.body).toEqual({ error: { code: "BAD_REQUEST", message: "Malformed JSON body" } });
    });

    it("rejects an empty PATCH", async () => {
      const { body } = await create({ title: "Patch me" });
      const res = await api().patch(`/api/v1/posts/${body.data.id}`).set(asAdmin()).send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("slugs", () => {
    it("gives each new post a unique slug", async () => {
      const a = await create({ title: "Same Title" });
      const b = await create({ title: "Same Title" });
      const c = await create({ title: "Other", slug: "same-title" });
      expect([a.body.data.slug, b.body.data.slug, c.body.data.slug]).toEqual([
        "same-title",
        "same-title-2",
        "same-title-3",
      ]);
    });

    it("returns 409 when renaming a slug to one already in use", async () => {
      await create({ title: "Taken" });
      const other = await create({ title: "Free" });
      const res = await api().patch(`/api/v1/posts/${other.body.data.id}`).set(asAdmin()).send({ slug: "taken" });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        error: { code: "CONFLICT", message: "Another post already uses this slug", details: { field: "slug" } },
      });

      const own = await api().patch(`/api/v1/posts/${other.body.data.id}`).set(asAdmin()).send({ slug: "free" });
      expect(own.status).toBe(200); // keeping your own slug is fine
    });

    it("rejects slugs that are not lowercase-hyphenated", async () => {
      const res = await create({ title: "Bad slug", slug: "Not A Slug!" });
      expect(res.status).toBe(400);
      expect(res.body.error.details[0].path).toBe("slug");
    });
  });

  describe("HTML sanitization", () => {
    it("strips scripts, event handlers and unsafe URLs but keeps article markup", async () => {
      const dirty = [
        "<h2>Title</h2>",
        `<p onclick="steal()">Hello <strong>world</strong><script>alert("x")</script></p>`,
        `<img src="https://img.example.com/a.png" onerror="steal()" alt="pic">`,
        `<a href="javascript:alert(1)">bad link</a>`,
        `<a href="https://example.com">external</a>`,
        `<iframe src="https://evil.example.com/embed"></iframe>`,
        `<iframe src="https://www.youtube.com/embed/abc123"></iframe>`,
        "<style>body{display:none}</style>",
      ].join("");

      const res = await create({ title: "Dirty", content: dirty, status: "PUBLISHED" });
      expect(res.status).toBe(201);
      const html: string = res.body.data.content;

      expect(html).not.toMatch(/<script|<style|onclick|onerror|javascript:|evil\.example/i);
      expect(html).toContain("<h2>Title</h2>");
      expect(html).toContain("<p>Hello <strong>world</strong></p>");
      expect(html).toContain(`<img src="https://img.example.com/a.png" alt="pic" loading="lazy" />`);
      expect(html).toContain(`<a href="https://example.com" target="_blank" rel="noopener noreferrer">external</a>`);
      expect(html).toContain(`<iframe src="https://www.youtube.com/embed/abc123"></iframe>`);

      // Updates are sanitized too.
      const patched = await api()
        .patch(`/api/v1/posts/${res.body.data.id}`)
        .set(asAdmin())
        .send({ content: "<p>ok</p><script>bad()</script>" });
      expect(patched.body.data.content).toBe("<p>ok</p>");
    });
  });
});
