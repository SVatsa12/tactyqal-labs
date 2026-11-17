# Deploying Tactyqal Labs

| Piece            | Host                    | Source                                               |
| ---------------- | ----------------------- | ---------------------------------------------------- |
| Database         | Neon                    | existing project (migrated + seeded)                 |
| API (`apps/api`) | Vercel, project #1      | this repo, root directory `apps/api`, preset Express |
| Web (`apps/web`) | Vercel, project #2      | this repo, root directory `apps/web`, preset Next.js |

Deploy in this order: **API project first** (the web build fetches posts from the API), then the **web project**, then go back to the API project once to set `CORS_ORIGINS`.

All values below are placeholders. Real secrets go in the Vercel dashboard only, never in git.

---

## 0. Before you start

- The repo is on GitHub: `https://github.com/SVatsa12/tactyqal-labs` (branch `main`).
- In the Neon console, open your project → **Connect** and copy two strings:
  - **Pooled** (host contains `-pooler`) → `DATABASE_URL`
  - **Direct** (connection pooling off) → `DIRECT_URL`, used only by migrations, which you run locally
- Append `&connect_timeout=15` to both. Neon computes sleep when idle and take a few seconds to wake; Prisma's default 5s connect timeout is too short. (The API also adds it automatically when missing.)
- Generate a JWT secret locally:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

The Neon database already has the migrations and the seed data (admin user, categories, tags, posts), so nothing needs to run against it for the first deploy. **Vercel never runs migrations.** When a new migration is added later, apply it from your machine before deploying: `pnpm --filter api db:deploy` (see [section 4](#4-migrations-seed-and-import-run-locally)).

---

## 1. Vercel project #1: API

How it works: Vercel's zero-config Express support finds `apps/api/index.js`, which default-exports the app from `createApp()` (no `listen()`). The whole API becomes one Vercel Function. The build runs `pnpm install` (whose `postinstall` runs `prisma generate`, including the `rhel-openssl-3.0.x` engine for Vercel's runtime) and then `pnpm run build` (`prisma generate` + `tsc` → `dist/`, which `index.js` loads). Local dev and `pnpm start` still use `src/server.ts`.

1. vercel.com → **Add New… → Project** → **Import** `SVatsa12/tactyqal-labs` (install the Vercel GitHub app for the repo if asked).
2. **Configure Project**:
   - **Project Name**: e.g. `tactyqal-api` (gives `https://tactyqal-api.vercel.app`)
   - **Root Directory**: click **Edit** → select `apps/api` → **Continue**
   - **Framework Preset**: **Express** (auto-detected once the root directory is set; pick it from the list if not)
   - **Build and Output Settings**: leave every override **off**. Vercel detects pnpm from the root `pnpm-lock.yaml`, installs the whole workspace and runs `pnpm run build`.
3. **Environment Variables** → paste (Vercel accepts a pasted `.env` block) and fill in:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
   JWT_SECRET=<the 96-char hex string you generated>
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=http://localhost:3000
   ```
   - `CORS_ORIGINS` is temporary; you set the real value in [section 3](#3-wire-the-two-together).
   - Do **not** set `NODE_ENV` (Vercel sets `production` at runtime, and setting it yourself makes the install skip the build tools) or `PORT` (not used on Vercel).
   - `DIRECT_URL`, `ADMIN_*`, `WP_BASE_URL` and `TEST_DATABASE_URL` are only for local migrations, scripts and tests. Leave them out.
4. **Deploy**. When it finishes, open the production URL (**Domains** on the project page, e.g. `https://tactyqal-api.vercel.app`). This is your **API URL**.
5. Check `https://<api-domain>/api/v1/health` → `{"data":{"status":"ok"}}`. The first call after Neon has been idle can take ~5–10s; the health check retries while the database wakes and answers `503` only if it is still down.
6. Recommended: **Settings → Functions → Function Region** → pick the region nearest your Neon region (for example Neon `aws-ap-southeast-1` → Vercel `sin1` Singapore), then redeploy. Every API request talks to the database, so this cuts latency a lot.

Notes:

- **Use the production domain** (`<project>.vercel.app`) for the web app. Preview deployment URLs are behind Vercel Authentication by default and would return a login page to the web server.
- **Rate limits are per function instance.** The limits (300 req/min per IP globally, 10 login attempts per 15 min, 5 leads per 15 min) live in memory, so on serverless each warm instance counts separately and the counters reset when an instance is recycled. Fine for this site's traffic; a shared store (for example Upstash Redis via `rate-limit-redis`) would make them global.
- **`/api/docs`** loads Swagger UI from a pinned jsDelivr build, because Vercel ignores `express.static()`, which `swagger-ui-express` relied on.
- `apps/api/railway.json` is kept for running the API on Railway (long-running server, migrations on start); it's unused on Vercel.

## 2. Vercel project #2: web

1. vercel.com → **Add New… → Project** → **Import** the same repo again.
2. **Configure Project**:
   - **Project Name**: e.g. `tactyqal-labs` (gives `https://tactyqal-labs.vercel.app`)
   - **Root Directory**: `apps/web`
   - **Framework Preset**: **Next.js** (auto-detected)
   - **Build and Output Settings**: leave the defaults.
3. **Environment Variables**:
   ```env
   API_URL=https://<api-domain>
   NEXT_PUBLIC_API_URL=https://<api-domain>
   NEXT_PUBLIC_SITE_URL=https://<web-project-name>.vercel.app
   ```
   - No trailing slashes.
   - `NEXT_PUBLIC_SITE_URL`: the production domain is `https://<project-name>.vercel.app` (the name on this screen). If it ends up different, fix the value and redeploy, because `NEXT_PUBLIC_*` values are baked in at build time.
4. **Deploy**. The build prerenders every published post from the API, so the API project must be up.
5. Note the production domain (project → **Domains**). This is your **site URL**.

## 3. Wire the two together

| Variable               | Project | Value                                                              |
| ---------------------- | ------- | ------------------------------------------------------------------ |
| `CORS_ORIGINS`         | API     | `https://<web-project-name>.vercel.app` (comma-separate extra domains, e.g. `https://tactyqal.com,https://www.tactyqal.com`) |
| `API_URL`              | web     | `https://<api-domain>` (server-side: blog pages, admin panel)      |
| `NEXT_PUBLIC_API_URL`  | web     | `https://<api-domain>` (browser: contact form)                     |
| `NEXT_PUBLIC_SITE_URL` | web     | `https://<web-project-name>.vercel.app` (canonical URLs, sitemap, OG) |

1. API project → **Settings → Environment Variables** → edit `CORS_ORIGINS` → the site origin (scheme + host, no path) → **Save**.
2. API project → **Deployments** → latest → **⋯ → Redeploy**. Vercel only applies changed variables to new deployments.
3. If you changed any `NEXT_PUBLIC_*` value on the web project, redeploy that one too.

Only the contact form calls the API from the browser, so CORS only matters there. Preview deployments of the web project have other origins, so the contact form is blocked on previews unless you add those origins too. Blog pages and admin work everywhere (they call the API from the server).

## 4. Migrations, seed and import (run locally)

Vercel runs none of these. Run them **from your machine** with `apps/api/.env` pointing at the Neon database (`DATABASE_URL`, `DIRECT_URL`; for the seed also `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` (10+ characters); for the import `WP_BASE_URL`).

```bash
pnpm --filter api db:deploy
```

```bash
pnpm --filter api db:seed
```

```bash
pnpm --filter api import:wp
```

```bash
pnpm --filter api content:recompute
```

- `db:deploy` applies pending migrations. Run it before deploying code that needs a new migration. (Already done for the current schema.)
- `db:seed` creates the admin user and the fallback posts. Safe to re-run (upserts). Only needed for a fresh database.
- `import:wp` imports the WordPress blog: 15s timeout per request, one progress line per page (`posts: page 3/45 — 60 posts`). If WordPress is down it says so and exits 0, leaving the seed posts in place. Options: `-- --limit 20`, `-- --dry-run`.
- `content:recompute` recomputes excerpts and reading times. Add `-- --dry` to preview.

## 5. Post-deploy smoke test

Replace `SITE` and `API` with your two URLs.

| # | Check | Expected |
| - | ----- | -------- |
| 1 | `API/api/v1/health` | `{"data":{"status":"ok"}}` (may take ~10s on the first call after Neon has been idle) |
| 2 | `API/api/docs` | Swagger UI loads and lists Auth, Posts, Categories, Tags, Leads |
| 3 | `SITE/` | Homepage renders; "From the blog" shows real posts, not "New articles are on their way"; no console errors |
| 4 | `SITE/blog` | Featured post + grid; search, category and tag filters work; pagination works |
| 5 | Open any post | Title, cover, content, reading time; the CTA at the end links to `/#contact` |
| 6 | `SITE/blog/does-not-exist` | Friendly 404 page |
| 7 | `SITE/sitemap.xml`, `SITE/robots.txt` | Absolute URLs on the site domain (not localhost); `/admin` disallowed |
| 8 | `SITE/admin` | Redirects to `/admin/login`; wrong password shows an error; correct login reaches the dashboard. DevTools → Application → Cookies: `tq_admin` is `HttpOnly` + `Secure` |
| 9 | Admin → New post → fill title + content → **Publish** | Success toast; post visible at `SITE/blog/<slug>` |
| 10 | `SITE/` | The new post appears in "From the blog" within 60s (usually immediately) |
| 11 | Admin → delete the test post | Gone from `/blog` and the homepage within 60s |
| 12 | Homepage contact form → submit a test lead | Success message; no CORS error in DevTools console |
| 13 | Admin → Leads | The test lead is listed (delete it afterwards) |
| 14 | Share `SITE/` in a link preview (or opengraph.xyz) | OG image + title from the site domain |
| 15 | Lighthouse (mobile) on `/`, `/blog`, one post | Performance ≥ 90, others 100 |

If the homepage says "New articles are on their way" or /blog says "The blog is taking a break": check `API_URL` on the web project and open the API health URL. Pages re-fetch every 60s, so they recover on their own once the API answers.

## Troubleshooting

- **API returns 500 on every route**: API project → **Logs**. `Invalid environment variables` lists the missing variable. `PrismaClientInitializationError … Query Engine` means the build didn't run `prisma generate`: redeploy with **Build Cache** off (Deployments → ⋯ → Redeploy → untick "Use existing Build Cache").
- **API build fails at install**: make sure `NODE_ENV` is not set as a variable on the API project, and that **Root Directory** is `apps/api` with "Include files outside the root directory" left on (default).
- **Health returns 503**: Neon is still waking up or unreachable. Retry after a few seconds, and check `DATABASE_URL` (pooled host).
- **Contact form: "CORS" error in console**: `CORS_ORIGINS` must exactly match the page origin (`https://`, no trailing path), and the API project must be redeployed after changing it.
- **Web shows the fallback but the API is fine**: `API_URL` must be the API's production domain, not a preview URL (previews are behind Vercel Authentication).
- **Admin login loops back to login**: the site must be served over https (the session cookie is `Secure` in production).
- **Images**: cover images must be `https://` URLs.
