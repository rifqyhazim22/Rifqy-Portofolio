# Rifqy Hazim HR — Portfolio (Next.js)

Next.js rebuild of the original Astro portfolio. It keeps the same content, navigation, and theme toggle while using the App Router so it can be deployed easily to Vercel.

## Tech Stack
- Next.js 15 (App Router) + React 19
- TypeScript with simple module aliases (`@/*` → `src/*`)
- Plain CSS for theming, layout, palettes, and pointer effects (`src/app/globals.css`)
- OpenAI Chat Completions (`gpt-5-nano`) for the AI navigation agent

## Project Structure
- `src/app` — Route tree and page components
- `src/components` — Shared UI pieces (Header, BaseLink, UpdatesList, ThemeToggle, NextSteps)
- `src/data` — Small data objects for navigation, updates, and links
- `public` — Static assets, including `favicon.svg` and placeholders

## Environment Variables

Copy `.env.local.example` → `.env.local` and populate the values from your secrets dashboard:

```bash
cp .env.local.example .env.local
# edit .env.local and fill in the keys below
```

| Variable | Scope | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | server only | Required for both `/api/agent` and `/api/librarian`. |
| `NEXT_PUBLIC_SUPABASE_URL` | shared | Supabase project URL. Safe to expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | shared | Public anon key used by the browser Supabase client. |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Needed for server actions/API routes to read & write protected tables. **Never** expose in client code. |
| `SUPABASE_JWT_SECRET` | server only | Keep for future auth hooks/webhooks. |
| `SUPABASE_OWNER_EMAIL` | server only | Email allowed into the `/owner` dashboard. Should match a Supabase Auth user. |
| `NEXT_PUBLIC_FORCE_IDENTITY_PROMPT` | shared | Optional. Set to `true` during development to always show the visitor identity form on refresh. Leave unset/`false` in production. |
| `NEXT_PUBLIC_SITE_URL` | shared | Optional. Set to your deployed domain (e.g., `https://rifqy-portofolio.vercel.app`) so Supabase magic links redirect correctly in production. |

Set the same variables in Vercel → Project Settings → Environment Variables (Production + Preview). Rotate any key immediately if it ever leaks into a public log.

## Supabase Setup

1. Create a new Supabase project (preferably in the APAC region for lowest latency from Indonesia).
2. In the SQL Editor, run the script at [`supabase/schema.sql`](supabase/schema.sql) to create tables, triggers, and Row Level Security policies.
3. Enable email/password auth in Supabase → Authentication → Providers. Create an owner account whose email matches `SUPABASE_OWNER_EMAIL`.
4. (Optional) Create a bucket in Supabase Storage (e.g., `portfolio-assets`) if you plan to offload hero/project images.
5. Copy the project URL + anon key + service-role key from Settings → API into `.env.local`.

The schema script enables RLS so only published content is readable with the anon key. Admin tasks go through the service-role key in server actions/API routes, so avoid using the anon key for mutations.

## Owner Dashboard

- Visit `/owner/login` and sign in with the Supabase Auth credentials created above (password or magic link).
- After authentication, `/owner` exposes:
  - **Section editor**: edit narrative snippets stored in `site_sections`.
  - **Projects/Testimonials managers**: CRUD helpers backed by `projects` and `testimonials` tables (with ordering + publish state).
  - **Agent sessions feed**: see recorded introductions (name + source) coming from the AI agent and librarian conversations.
- Signing out clears the Supabase session and redirects back to `/owner/login`.

All mutations happen via server actions that require the owner email check and use the service-role key, so public traffic cannot modify data.

## Visitor Identity & Agent Tracking

- Both the floating AI agent and the librarian now prompt visitors for **name** and **“you found this site from?”** once per browser (stored in `localStorage`).
- If the user is signed in as the owner, the prompt is skipped automatically.
- Identity details and agent usage are written to the `agent_sessions` table. You can inspect them in Supabase Studio or the `/owner` dashboard.
- A dedicated API endpoint (`/api/analytics/agent`) is also available if you want to log additional agent events from the client side.
- The contact form (`/contact`) posts to `/api/contact`, which stores entries in the `contact_messages` table (metadata includes language, page path, and user-agent).

## Dynamic Content Overrides

- Public pages consume Supabase data whenever it's available:
  - `site_sections` overrides home sections via slugs such as `home-hero`, `home-promo`, `home-what-i-do`, `home-playbooks`, `home-learning`, `home-updates`, and `home-featured` (metadata should mirror the shape of the corresponding content objects).
  - `projects` powers `/projects`, `/works` (featured flag), and the "Featured Projects" block on the homepage.
  - `testimonials` feeds the testimonial deck on `/about`.
- If the database is empty or Supabase is not configured, the site gracefully falls back to the static dictionary content bundled in the repo.
- After editing content via the owner dashboard, the site revalidates automatically. If you edit data directly in Supabase Studio, trigger `npm run build` locally or redeploy on Vercel to refresh cached pages.

## Local Development
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` to view the site.

## Production Build
```bash
npm run build
```
This outputs a static build ready for Vercel or any Node-compatible hosting. `npm start` runs the production server locally if needed.

## Deploying to Vercel
1. Push this repository to GitHub.
2. In Vercel, create a project from the repo (use the `main` branch).
3. Keep the default build command (`npm run build`) and output directory (`.next`).
4. (Optional) Add an env var `SITE_URL` if you want canonical URLs for a custom domain.
5. Trigger a deploy.
