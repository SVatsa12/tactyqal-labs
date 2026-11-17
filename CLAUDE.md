# Project: Tactyqal Labs — Website + Blog Platform (hire-a-thon submission)

## Goal
Replace Tactyqal Labs' current site (CodeIgniter main site + separate WordPress blog) with ONE modern codebase:
- Task 1: redesigned homepage (same content as https://tactyqal.com, modern UI/UX, fully responsive).
- Task 2: custom blog platform — PostgreSQL + REST CRUD API + public blog + admin panel + WordPress importer.
The homepage "From the blog" section must read live from our API.
Deadline is tight: prefer simple, working, clean code over clever abstractions.

## Monorepo (pnpm workspaces)
- apps/web — Next.js 15 App Router, TypeScript (strict), Tailwind CSS v4, shadcn/ui, motion, lucide-react
- apps/api — Express + TypeScript (strict), Prisma, PostgreSQL (Neon), Zod, jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit, swagger-ui-express, pino-http
- Node 20+. Use `tsx` for api dev, `tsc` for api build.

## Design System (follow exactly)
Audience: parents of teens (buyers) + teens (builders). Feel: warm, trustworthy, energetic, editorial — like Brilliant.org / Linear / Framer marketing sites. Light theme only.
Colors (define as CSS variables + Tailwind theme tokens, never hardcode hex in components):
- --bg #FAFAF7 | --surface #FFFFFF | --ink #0E0E12 | --muted #5B5B66 | --border #E8E6E1
- --brand #F2541B (primary buttons, links, highlights) | --brand-soft #FFF1EB | --accent #FFD66B (marker underline / tiny highlights only)
- One dark band allowed (final CTA): bg --ink, white text.
Typography: headings "Bricolage Grotesque" (600–700, tracking-tight), body "Geist Sans"; both via next/font.
Scale: H1 clamp(2.5rem, 6vw, 4.5rem); H2 clamp(2rem, 4vw, 3rem); body 16–18px, leading-relaxed.
Shape: radius 16px cards, 24px large panels, full-rounded buttons; 1px --border; shadows very soft (0 1px 2px + 0 8px 24px at ~4–6% opacity).
Spacing: sections py-24 md:py-32; container max-w-6xl px-6; generous whitespace.
Motion (motion library): fade-up on enter (y: 16 → 0, 0.5s, once), card hover lift (-2px + shadow), respect prefers-reduced-motion. Nothing else.
BANNED: dark navy/teal themes, neon glow, glassmorphism, 3D tilt cards, purple/rainbow gradients, emoji as icons, stock photos of people, Lorem ipsum, unmodified default shadcn styling.
Images: no real photos available — use CSS/SVG-built device mockups, gradient-free flat illustrations, initial-letter avatars.

## Content rules
- All homepage copy lives in apps/web/src/content/site.ts (typed). Components never hardcode copy.
- Use only facts from the live site. Use "100+ students mentored" consistently. Do not invent numbers, names or quotes.

## Code rules
- TypeScript strict, no `any`. Small components in apps/web/src/components/{layout,sections,blog,admin,ui}.
- Server Components by default; "use client" only where interaction/animation needs it.
- Accessibility: semantic landmarks, one h1, visible focus rings, alt text, aria-labels on icon buttons, color contrast AA.
- API: routes under /api/v1; response `{ data, meta? }`; errors `{ error: { code, message, details? } }`; Zod on every input; central error handler.
- Env vars documented in .env.example for each app. Never commit secrets.
- After each task: make sure `pnpm build` passes for touched apps, then summarize what changed.
