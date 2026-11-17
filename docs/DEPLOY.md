# Deploying Tactyqal Labs

| Piece             | Host    | Source                           |
| ----------------- | ------- | -------------------------------- |
| Database          | Neon    | existing project (already seeded) |
| API (`apps/api`)  | Railway | this repo, `apps/api/railway.json` |
| Web (`apps/web`)  | Vercel  | this repo, root directory `apps/web` |

Deploy in this order: **Railway first** (the web build fetches posts from the API), then **Vercel**, then go back to Railway once to set `CORS_ORIGINS`.

All values below are placeholders. Real secrets go in the Railway / Vercel dashboards only, never in git.

---

## 0. Before you start

- The repo is on GitHub: `https://github.com/SVatsa12/tactyqal-labs` (branch `main`).
- In the Neon console, open your project → **Connection Details** and copy two strings:
  - **Pooled** (host contains `-pooler`) → `DATABASE_URL`
  - **Direct** (toggle "Connection pooling" off) → `DIRECT_URL`
- Append `&connect_timeout=15` to both. Neon computes sleep when idle and take a few seconds to wake; Prisma's default 5s connect timeout is too short. (The API also adds it automatically when missing.)
- Generate a JWT secret locally:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

The Neon database already has the migrations and the seed data (admin user, categories, tags, posts) from development, so nothing needs to be seeded for the first deploy. See [Seed / import against Neon](#4-seed--import-against-neon-only-if-needed) if you use a fresh Neon branch.

---

## 1. Railway (API)

1. railway.com → **New Project** → **Deploy from GitHub repo** → pick `SVatsa12/tactyqal-labs`. (Grant Railway access to the repo if asked.)
2. Railway creates a service and may start a build straight away. It will fail until the next steps are done; that's fine.
3. Open the service → **Settings**:
   - **Source → Root Directory**: leave **empty** (repo root). This is a pnpm workspace: the lockfile and `pnpm-workspace.yaml` live at the root, so building from `apps/api` alone would lose the lockfile. The config below scopes everything to the API with `--filter api`.
   - **Config-as-code → Railway Config File**: `/apps/api/railway.json`
     This sets, so you don't have to type them:
     - Build: `pnpm install --frozen-lockfile --prod=false && pnpm --filter api build` (install, `prisma generate`, `tsc`)
     - Start: `pnpm --filter api start` → `prisma migrate deploy` (retried for Neon cold starts), then `node dist/server.js`
     - Health check: `/api/v1/health`, timeout 300s (it retries the DB itself and answers 503 until Neon is awake)
     - Restart on failure, watch paths `/apps/api/**` + root workspace files (web-only commits don't redeploy the API)
4. **Variables** tab → **Raw Editor** → paste and fill in:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
   DIRECT_URL=postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
   JWT_SECRET=<the 96-char hex string you generated>
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=http://localhost:3000
   ```
   - Do **not** set `PORT`; Railway injects it and the API listens on it.
   - `CORS_ORIGINS` is a temporary value; you set the real one in step 3.
   - `ADMIN_*` and `WP_BASE_URL` are only read by the seed / import scripts, not by the server. Leave them out.
5. **Settings → Networking → Public Networking → Generate Domain**. Accept the port Railway suggests (it matches `$PORT`). You get something like `https://tactyqal-labs-production.up.railway.app`. This is your **API URL**.
6. **Deployments** → **Deploy** (or it redeploys on the variable change). Watch the deploy logs for:
   - `No pending migrations to apply.` (or the migrations being applied)
   - `API listening on port …`
   - `Database connected in …ms`
7. Check it in a browser: `https://<api-domain>/api/v1/health` → `{"data":{"status":"ok"}}`.

## 2. Vercel (web)

1. vercel.com → **Add New… → Project** → import `SVatsa12/tactyqal-labs`.
2. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web` (click Edit, select the folder)
   - **Build and Output Settings**: leave the defaults. Vercel sees `pnpm-lock.yaml` and `packageManager: pnpm@9` at the repo root and runs `pnpm install` for the whole workspace, then `next build` in `apps/web`. If you want to set it explicitly, Install Command: `pnpm install --frozen-lockfile`.
   - **Node.js version** (Settings → General after creation): 20.x or 22.x.
3. **Environment Variables** (all environments):
   ```env
   API_URL=https://<api-domain>
   NEXT_PUBLIC_API_URL=https://<api-domain>
   NEXT_PUBLIC_SITE_URL=https://<project-name>.vercel.app
   ```
   - No trailing slashes.
   - `NEXT_PUBLIC_SITE_URL`: Vercel's production domain is `https://<project-name>.vercel.app` (the project name shown on this screen). If it ends up different, fix the value and redeploy, because `NEXT_PUBLIC_*` values are baked in at build time.
4. **Deploy**. The build prerenders every published post from the API, so it needs the Railway API to be up.
5. Note the production domain (Project → **Domains**). This is your **site URL**.

## 3. Wire the two together

Once you have both URLs:

| Variable              | Where   | Value                                                         |
| --------------------- | ------- | ------------------------------------------------------------- |
| `CORS_ORIGINS`        | Railway | `https://<project-name>.vercel.app` (add a custom domain comma-separated, e.g. `https://tactyqal.com,https://www.tactyqal.com`) |
| `API_URL`             | Vercel  | `https://<api-domain>` (server-side: blog pages, admin panel) |
| `NEXT_PUBLIC_API_URL` | Vercel  | `https://<api-domain>` (browser: contact form)                |
| `NEXT_PUBLIC_SITE_URL`| Vercel  | `https://<project-name>.vercel.app` (canonical URLs, sitemap, OG) |

1. Railway → Variables → set `CORS_ORIGINS` to the Vercel site origin (scheme + host, no path). Railway redeploys automatically.
2. If you changed any `NEXT_PUBLIC_*` value on Vercel, **Deployments → ⋯ → Redeploy**.

Only the contact form calls the API from the browser, so CORS only matters there. Vercel preview deployments (`*-git-*.vercel.app`) have different origins: the contact form will be blocked on previews unless you add that origin too. Blog pages and admin work everywhere (they call the API from the server).

## 4. Seed / import against Neon (only if needed)

Not needed for the existing Neon database. For a fresh Neon branch, run these **once from your machine** with `apps/api/.env` pointing at that branch (`DATABASE_URL`, `DIRECT_URL`, plus `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` (10+ characters), `WP_BASE_URL`):

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

- `db:deploy` applies migrations (Railway also does this on every deploy).
- `db:seed` creates the admin user and the fallback posts. Re-running it is safe (upserts).
- `import:wp` imports the WordPress blog. 15s timeout per request, progress per page (`posts: page 3/45 — 60 posts`). If WordPress is down it says so and exits 0, leaving the seed posts in place. Options: `-- --limit 20`, `-- --dry-run`.
- `content:recompute` recomputes excerpts and reading times. Add `-- --dry` to preview.

Running them locally avoids storing `ADMIN_PASSWORD` on Railway.

## 5. Post-deploy smoke test

Replace `SITE` and `API` with your two URLs.

| # | Check | Expected |
| - | ----- | -------- |
| 1 | `API/api/v1/health` | `{"data":{"status":"ok"}}` (may take ~10s on the first call after Neon has been idle) |
| 2 | `API/api/docs` | Swagger UI loads and lists auth, posts, categories, tags, leads |
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

If the homepage says "New articles are on their way" or /blog says "The blog is taking a break": check `API_URL` on Vercel and the Railway health URL. The page re-fetches every 60s, so it recovers on its own once the API answers.

## Troubleshooting

- **Railway health check fails**: open the deploy logs. `Invalid environment variables` lists the missing variable. `P1001` during `prisma migrate deploy` means Neon unreachable: check `DIRECT_URL` (must be the non-pooled host).
- **Contact form: "CORS" error in console**: `CORS_ORIGINS` must exactly match the page origin (`https://`, no trailing path).
- **Admin login loops back to login**: the site must be served over https (the session cookie is `Secure` in production).
- **Images**: cover images must be `https://` URLs.
