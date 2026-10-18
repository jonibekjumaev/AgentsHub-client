# AgentsHub — Design System (Direction A · Clean SaaS)

Single source of truth for how the client looks. Code (MUI theme, components) must follow this file.
If a mockup and this file disagree, this file wins — then fix the mockup.

- Mockups: `docs/design/*.html` (open in a browser; inline styles = exact values).
- API contract: `docs/FRONTEND_MIGRATION.md`.
- Pending mockups (drawn just before their slice): profile settings, change password, favorites/visited/follows,
  community list/detail/write, admin pages, 404/500, FAQ/About, states (empty/error/skeleton, PAUSED, CLOSED,
  blocked), mobile views.

---

## 1. Principles

1. **Trust over decoration.** Neutral ground, one accent color, real data density. No gradients on UI chrome, no emoji.
2. **Numbers are mono.** Prices, counts, stats use JetBrains Mono — they scan faster and look precise.
3. **Every screen has 4 states:** loading (skeleton), empty, error, success. A page is not done without all four.
4. **Accessible by default:** real `<button>` / `<a>` / `<label>`, visible focus ring, contrast ≥ 4.5:1 for text.
5. **Mobile is real.** Every layout is fluid (wrap / auto-fill grids). No `pc/` vs `mobile/` code branches.

---

## 2. Tokens

Implement as `src/theme/tokens.ts`; the MUI theme (`src/theme/theme.ts`) reads only from tokens.

### 2.1 Color

| Token | Value | Use |
|---|---|---|
| `ground` | `#F6F7F9` | Page background |
| `surface` | `#FFFFFF` | Cards, header, inputs |
| `surfaceMuted` | `#FAFBFC` | Closed/inactive rows, upload dropzone |
| `ink` | `#0F172A` | Headings, primary text |
| `body` | `#334155` | Body text |
| `bodySoft` | `#475569` | Secondary body text |
| `muted` | `#5B6475` | Meta text, hints, captions |
| `border` | `#E3E7EE` | Card and header borders |
| `borderSoft` | `#EEF1F5` | Dividers inside cards |
| `inputBorder` | `#CBD2DC` | Form controls |
| `accent` | `#4338CA` | Primary actions, links, active nav |
| `accentHover` | `#312E81` | Hover/pressed for accent |
| `accentSoft` | `#EEF0FF` | Category chips, active sidebar item, selected cards |
| `accentBorder` | `#C7CCFF` | Soft secondary buttons (Follow, Reopen) |
| `success` / `successSoft` | `#0F766E` / `#E6F4F2` | OPEN status, "Free", contacts icon |
| `warning` / `warningSoft` | `#92400E` / `#FEF3C7` | PAUSED status, rank top-3, deadline-passed hint |
| `danger` | `#B91C1C` | Destructive text, field error text |
| `dangerBorder` | `#DC2626` | Invalid input border |
| `dangerSoft` / `dangerSoftBorder` / `dangerInk` | `#FEF2F2` / `#FECACA` / `#991B1B` | Error alert box |
| `neutralSoft` | `#F1F3F6` | CLOSED status, neutral avatars |

### 2.2 Typography

Fonts via `next/font/google`: **Manrope** 400/500/600/700/800 (UI), **JetBrains Mono** 500 (numbers).

| Role | Size / weight / extra |
|---|---|
| Display (Home hero) | see `Home.html` |
| H1 page title | 30–34px / 800 / letter-spacing -0.03em |
| H2 section | 20–22px / 800 / -0.02em |
| H3 card section | 17px / 800 |
| Body | 15px / 500 / line-height 1.6–1.7 |
| Body small | 14px / 500–600 |
| Meta | 13px / 500 / `muted` |
| Caption, hint | 12px / 500 / `muted` |
| Overline | 12px / 800 / uppercase / letter-spacing 0.08em / `muted` |
| Mono number | JetBrains Mono 500; 20px in stat tiles, 15–16px inline |

### 2.3 Spacing, radius, layout

- Spacing scale (px): 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 64. MUI `spacing` = 4px.
- Radius: 8 (small buttons, nav items), 10 (inputs, buttons), 12 (cards), 16 (auth/form shells), 999 (chips, avatars).
- Container: `max-width: 1200px; padding: 0 24px` (forms: 1100px).
- Header height: 64px. Page top padding: 32–40px. Page bottom: 64px.
- Breakpoints (MUI default): `sm 600`, `md 900`, `lg 1200`.
  - `< md`: dashboard sidebar becomes horizontal scrollable tabs above content; two-column pages stack.
  - `< sm`: single column; side gutter 16px.
- Shadows: none on cards (borders only). Only menus/dialogs use MUI elevation.

---

## 3. Components

Shared components live in `src/shared/ui/`; domain cards live in their feature.

### Buttons
| Variant | Spec |
|---|---|
| Primary | bg `accent`, white text 800, height 46 (forms) / 50 (auth submit) / 38–44 (header, page actions), radius 10 |
| Secondary | bg `surface`, border `border`, text `ink` 700 |
| Soft | bg `accentSoft`, border `accentBorder`, text `accent` 700 (Follow, Reopen) |
| Danger text | bg `surface`, border `border`, text `danger` 700 (Delete) — always confirms in a dialog |
| Small | height 36, radius 8, 13px |
Loading state: spinner replaces label, width stays the same, button disabled.

### Form controls
- Input/select: height 46, radius 10, border `inputBorder`, 15px/500. Label above: 14px/700, gap 6px.
- Hint under field: 12px/500 `muted`. Counter right-aligned in the same row (`30 / 100`).
- Error: border `dangerBorder`, message 12px/600 `danger`, `aria-invalid` + `aria-describedby`.
- Valid hint (e.g. password rule met): 12px/600 `success` with check icon.
- Radio cards (role, pricing): 1px `border`, selected = 2px `accent` + `accentSoft` bg.
- Tag input: chips inside a bordered box; chip = `accentSoft` pill with remove button.
- Image uploader: grid of 4:3 tiles, first tile badged "Cover", dashed add tile.

### Chips / badges
- Status: pill 11–12px/800 uppercase — OPEN (`successSoft`/`success`), CLOSED (`neutralSoft`/`bodySoft`),
  PAUSED (`warningSoft`/`warning`), ACTIVE/BLOCKED for admin similarly.
- Category: pill `accentSoft`/`accent` 11–12px/700.
- Role badge ("Creator"), "Author" badge in comments, Rank `#n` (top-3 warning colors, others neutral).

### Price (`PriceTag`)
| Pricing type | Display |
|---|---|
| FREE | "Free" text, `success`, 800 |
| ONE_TIME | `$190` mono |
| SUBSCRIPTION | `$29` mono + ` / mo` 12px `muted` |
| CUSTOM | "Custom" text, `body`, 800 |
Formatting goes through `src/shared/lib/format.ts` (Intl, current locale, USD).

### Cards
- Base: `surface`, 1px `border`, radius 12, no shadow; image area 16:10 on top.
- `AgentCard`: image, category chip, title (link), "by @nick", divider, PriceTag + likes/views meta.
- `BriefCard` / brief row: status + category chips, title, budget / deadline / views·comments meta, actions on the right (wrap below on mobile).
- `CreatorCard`: initials avatar 52px radius 14, name + rank, @nick, 2-line description, stats row, Follow button.

### Navigation
- Header: logo `Agents` + `Hub` in `accent`, nav Agents / Briefs / Creators / Community, right side = Log in + Sign up (guest) or Dashboard + avatar (member) + language switcher. Active link `accent` + `aria-current="page"`.
- Dashboard sidebar: overline title, items 14px, active = `accentSoft` bg + `accent` text 700. Items depend on role (see §5).
- Tabs: underline style, active = 2px `accent` bottom border, counts in `muted`.
- Breadcrumb: 13px `muted`, current page `ink` 600.
- Pagination: 40×40 squares, radius 8, active = `accent` filled.

### Feedback
- Error alert: `dangerSoft` bg, `dangerSoftBorder` border, `dangerInk` text, icon, `role="alert"`.
- Toast (notistack) for success after mutations; no SweetAlert.
- Confirm dialog (MUI Dialog) for destructive actions.
- Skeletons mirror the real layout (card grid → card skeletons). No full-page spinners.
- Empty state: icon in `accentSoft` square, title 800, one-line text, one primary action.

### Avatars
Initials in a circle (header 36, comments 36, profile 96 radius 24). Colors rotate between
`accentSoft/accent`, `successSoft/success`, `warningSoft/warning`, `neutralSoft/body` by a stable hash of member id.
Uploaded image replaces initials.

---

## 4. Content rules

- **Contacts** (phone, email, WhatsApp) render only for logged-in ACTIVE members, with caption
  "Visible because you are signed in." Guests see a "Log in to see contacts" prompt instead (D-07/D-23).
- **Login error** is always the single message "Wrong member nick or password." (D-27).
- **Plain text only** for descriptions, briefs, articles, comments. Render with `white-space: pre-line`, no HTML.
- Owner of a PAUSED agent sees a warning banner on its detail page; others get 404 (D-16/D-29).
- Brief lifecycle actions follow D-30: OPEN → Edit / Close / Delete; CLOSED → Reopen / Delete; expired deadline → "Set a new date to reopen".

---

## 5. Page map

| Route | Mockup | Access |
|---|---|---|
| `/` | Home.html | public |
| `/login` | Login.html | guest only |
| `/signup` | Signup.html | guest only |
| `/agents` | Agents.html | public |
| `/agents/[id]` | AgentDetail.html | public (contacts: member) |
| `/briefs` | Briefs.html | public |
| `/briefs/[id]` | BriefDetail.html | public (contacts: member) |
| `/creators` | Creators.html | public |
| `/members/[id]` | MemberProfile.html | public |
| `/community`, `/community/[id]` | pending | public |
| `/dashboard` | Dashboard.html | CREATOR, USER |
| `/dashboard/agents`, `/new`, `/[id]/edit` | Dashboard.html, AgentForm.html | CREATOR |
| `/dashboard/briefs`, `/new`, `/[id]/edit` | MyBriefs.html, BriefForm.html | USER |
| `/dashboard/articles`, `/favorites`, `/visited`, `/follows`, `/settings` | pending | CREATOR, USER |
| `/admin/*` | pending | ADMIN |
| `/404`, `/500`, `/faq`, `/about` | pending | public |

Dashboard sidebar items — CREATOR: Overview, My agents, Articles, Favorites, Followers, Profile settings.
USER: My briefs, Favorites, Recently visited, Articles, Following, Profile settings.
ADMIN: Members (`/admin/members`), Agents (`/admin/agents`), Briefs (`/admin/briefs`), Articles (`/admin/articles`);
the header "Dashboard" button leads ADMIN to `/admin/members`.

---

## 6. i18n

- Library: `next-i18next`. Locales: `en` (default, no URL prefix), `ko`, `uz`. `localeDetection: false`.
- Files: `public/locales/{en,ko,uz}/{common,auth,agents,briefs,creators,community,dashboard,admin,errors}.json`.
- No hard-coded UI strings in components — always `t('namespace:key')`. User content is never translated.
- Backend errors map by code/message to keys in `errors.json`; raw backend text is never shown.
- Dates, numbers, prices: `Intl` via `src/shared/lib/format.ts` with the active locale.
- Missing `ko`/`uz` keys fall back to `en`. Text must survive ~30% longer strings (no fixed-width buttons).
- Korean: Manrope has no Hangul glyphs — add `Noto Sans KR` as fallback in the font stack.
