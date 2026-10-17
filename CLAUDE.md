# AgentsHub Client — rules for Claude Code

AgentsHub is an AI agents marketplace: CREATORs list agents (products), USERs post briefs (requests),
members follow creators, like, comment and write community articles. ADMIN moderates.

This repo is the Next.js client. It started as a copy of `nestar-next` (real-estate demo) and is being
rebuilt (approach C): keep the infrastructure, rebuild the domain UI.
Backend (NestJS + GraphQL) lives in a separate repo: `C:\Users\jonik\Desktop\AgentsHub`.

## Read first
- `docs/FRONTEND_MIGRATION.md` — API contract: queries, mutations, inputs, enums, error codes, decisions D-01…D-32.
- `docs/DESIGN.md` — design system (tokens, components, page map, i18n rules).
- `docs/design/*.html` — page mockups. Inline styles are the exact target values.

## Stack
Next.js 14 **Pages Router** (no App Router) · React 18 · TypeScript (strict) · MUI 5 + Emotion ·
Apollo Client 3 · next-i18next (`en` default, `ko`, `uz`) · yarn.

## Naming (important)
- Nestar "property" = AgentsHub **agent** (product). Nestar "agent" (person) = AgentsHub **creator**.
- Routes: products at `/agents`, creators at `/creators`, profiles at `/members/[id]`.
- Detail pages use dynamic routes (`/agents/[id]`), never `?id=` query params.

## Target structure
```
src/
  pages/        routing only — thin files: fetch params, pick layout, render a feature component
  features/     auth, agents, briefs, creators, members, community, comments, follows, likes, dashboard, admin
                each: components/  graphql/  hooks/  index.ts (public exports)
                members = public member profile (/members/[id]) shared by USER and CREATOR;
                creators = creators list and creator cards only
  shared/       ui/ (StatusChip, PriceTag, EmptyState, ErrorState, Skeleton, Pagination, FormField)
                layout/ (Header, Footer, PublicLayout, AuthLayout, DashboardLayout)
                lib/ (format.ts, validation)
  apollo/       client, authLink, errorLink, cache
  auth/         token session, useMe, RequireRole
  theme/        tokens.ts, theme.ts
  config/env.ts env access + validation (the only place that reads process.env)
  gql/          GraphQL codegen output — generated, never edit by hand
public/locales/{en,ko,uz}/*.json
```
Import alias: `@/` → `src/`.

## Code rules
1. A feature never imports another feature's internals — only `shared/*` or another feature's `index.ts`.
2. Types come from codegen (`src/gql`). Do not hand-write GraphQL types or enums that the schema provides.
3. Styling: MUI theme + `sx`/`styled` only, values from `theme/tokens.ts`. No new SCSS, no hex colors in components.
4. No hard-coded UI text. Use `t('namespace:key')`; add the key to `public/locales/en/*.json`.
   Do not invent `ko`/`uz` translations — leave them for review (fallback is `en`).
5. Every data page handles loading (skeleton), empty, error and success.
6. Responsive by default (flex-wrap / grid auto-fill / MUI breakpoints). No `pc` vs `mobile` component branches.
7. User content (descriptions, briefs, articles, comments) is plain text: render with `white-space: pre-line`. Never `dangerouslySetInnerHTML`.
8. Accessibility: semantic elements, labels on every control, `aria-current` on active nav, `role="alert"` on errors.
9. Show backend errors through the error mapping (`errors.json`), never raw backend messages.
10. Apollo: read `data`/`error`/`loading` from useQuery; do not use the onCompleted/onError
    callback options (deprecated in 3.14, removed in Apollo 4).
11. SSR props contain public data only. Contacts and anything member-specific are fetched
    client-side after auth.
12. Server-side Apollo: one client per request (`initializeApollo()` + `addApolloState`), no auth
    header, public data only. Never keep a server client in module scope.
13. GraphQL documents use `graphql()` from `@/gql`; run `yarn codegen` after changing a document.
14. Never run `yarn build` while `yarn dev` is running — they share `.next/` and the dev server breaks.
    Restart `yarn dev` after `yarn install` (changed `node_modules` break the running dev server).

## Security rules (strict)
- Never read, print or edit `.env`, `.env.local`, `.env.development`. Use `.env.example` to see which keys exist.
- Never log tokens, passwords or full member objects. No `console.log` left in committed code.
- Do not decode the JWT on the client to decide who the user is — use the `me`/member query from the server.
- Contacts (phone, email, WhatsApp) render only for signed-in ACTIVE members.
- Do not add a dependency without saying why, in the plan, before installing.

## Workflow
- Work only on the part the prompt asks for. If you find another problem, list it in the report — do not fix it silently.
- Start with a short plan (files to create/change/delete). Then implement.
- Before reporting, run: `yarn tsc --noEmit`, `yarn lint`, `yarn build`. All must pass.
- Do **not** run `git commit` or `git push` — the developer commits after review.
- Reply to the developer in Uzbek; keep technical terms (component, hook, query, props…) in English.

## Report format
1. What was done (1–3 lines)
2. Files: created / changed / deleted
3. Checks: tsc / lint / build results
4. How to test in the browser (steps)
5. Open issues or questions (if any)
