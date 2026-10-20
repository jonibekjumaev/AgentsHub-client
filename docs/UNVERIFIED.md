# Unverified work (written without running codegen / tsc / tests)

Slices S4 and later were written straight into the repo while the developer was away, with no way to run
`yarn codegen`, `tsc`, `lint`, `test` or `build`. Only a syntax check (esbuild) was run.
Work through this list once, top to bottom, then delete the file.

## Status (2026-10-20)

- [x] `yarn codegen` — pass (fixed: `MemberUpdate` has no `_id`, `BoardArticleUpdate` has no `articleCategory`)
- [x] `yarn typecheck` — pass
- [x] `yarn lint` — pass, 0 warnings
- [x] `yarn test` — 67 files / 479 tests pass (after the DashboardHome redirect-loop fix and the `briefForm.test` helper fix)
- [x] `yarn build` — pass (57 s, 72 pages); `/` is ISR (300 s)
- [ ] Browser walk-through — section 4
- [ ] Decided limit changes — section 6

## 0. Order of checks

1. Backend running on 3005 → `yarn codegen`. Codegen fails on the first field or type the schema does not
   have — fix the document (list below says which guesses are most likely), run again.
2. `yarn tsc --noEmit`
3. `yarn lint --fix` (formatting of hand-written files may differ from Prettier), then `yarn lint`
4. `yarn test` — new suites listed per slice below
5. `yarn build`
6. Browser walk-through per slice (section 3)

## 1. Schema guesses (codegen will tell)

Names taken from Nestar + FRONTEND_MIGRATION.md, not from the live schema.

### Comments (S4)
- [ ] `Comment` has `memberId`, `commentGroup`, `commentRefId`, `createdAt`, `memberData { _id memberNick memberFullName memberImage }`
- [ ] `getComments(input: CommentsInquiry!)` returns `{ list, metaCounter { total } }`
- [ ] `CommentsInquiry` accepts `page, limit, sort, direction, search { commentRefId, commentGroup }`
- [ ] `createComment(input: CommentInput!)` with `commentGroup, commentRefId, commentContent`
- [ ] `updateComment(input: CommentUpdate!)` with `_id, commentStatus`; returns `commentStatus`

### Briefs (S4, S5)
- [ ] `BriefsInquiry.search` (`BISearch`) has `text`, `categoryList`, `briefStatus`, `memberId`
- [ ] `Brief.memberId` exists (OwnerBriefQuery)
- [ ] `getMyBriefs(input: MyBriefsInquiry!)`; `search: {}` accepted (is `search` required?)
- [ ] `getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: OPEN } })` inline literal accepted
- [ ] `BriefInput` / `BriefUpdate`: `briefDeadline` is `DateTime` (ISO string accepted), `briefBudget` Float

### Creators, members, follows (S6)
- [ ] `getCreators(input: CreatorsInquiry!)` returns `Members { list, metaCounter }`
- [ ] `Member` has `memberDesc`, `memberRank`, `memberArticles`, `memberFollowings`, `memberLikes`, `memberViews`
- [ ] `Member.meFollowed { followingId followerId myFollowing }` exists (Nestar `MeFollowed`)
- [ ] Follow inquiry input is named `FollowInquiry` (`getMemberFollowers` / `getMemberFollowings`)
- [ ] `subscribe(input: String!)` / `unsubscribe(input: String!)` return `Follower { _id followingId followerId }`
- [ ] `Follower.followerData` / `followingData` are `Member`
- [ ] `memberRank` is treated as a **score** (sorted DESC, like `productRank` on /agents). Cards show "#n" = position
      in the top-ranked list, not the score; profiles show no rank until the backend has a rank position (Step 13a backlog)

### Account, favorites (S7)
- [ ] `getMe` has `memberDesc`; `MemberUpdate` accepts `memberDesc`, `memberEmail`, `memberWhatsapp` and `null` to clear them
- [ ] `imageUploader(file, target: "member")` — target name for profile pictures
- [ ] `changePassword(input: ChangePasswordInput!)` with `currentPassword`, `newPassword`
- [ ] `getFavorities` / `getVisited` input type is `OrdinaryInquiry` (`page`, `limit`)
- [ ] memberDesc limit: the form allows 500 characters — set it to the DTO's real limit

### Community (S8)
- [ ] `BoardArticle` fields: `articleCategory articleStatus articleTitle articleContent articleImage articleLikes articleViews articleComments memberId memberData meLiked`
- [ ] `getBoardArticles(input: BoardArticlesInquiry!)`, search has `articleCategory`, `text`, `memberId`
- [ ] `createBoardArticle(input: BoardArticleInput!)`, `updateBoardArticle(input: BoardArticleUpdate!)` (delete = `articleStatus: DELETE`)
- [ ] `likeTargetBoardArticle(articleId)` returns `BoardArticle { _id articleLikes }`; `imageUploader(target: "article")`
- [ ] Chat frames: `message` and `info` payload fields are at the top level next to `event` (as parsed in `community/lib/chat.ts`)
- [ ] `NEXT_PUBLIC_API_WS=ws://localhost:3005` reaches the socket (no path)

### Admin (S9)
- [ ] Input types: `MembersInquiry`, `AllProductsInquiry`, `AllBriefsInquiry`, `AllBoardArticlesInquiry`, `MemberUpdateByAdmin`
- [ ] `ALPISearch` accepts `text` (the agents admin search sends it); `ABAISearch` has no `text` (articles: no search box)
- [ ] `remove*ByAdmin` return a type with `_id` (Product / Brief / BoardArticle)

### Home, sitemap (S10)
- [ ] The API accepts `limit: 100` on the public lists used by `/sitemap.xml` (if it caps lower, lower `LIMIT`)
- [x] `getStaticProps` + `revalidate: 300` on `/` works with the per-request Apollo client (ISR, no token) — confirmed: `yarn build` passes, prerender-manifest has `initialRevalidateSeconds: 300` for `/en`, `/ko`, `/uz`.

## 2. Behaviour decisions to confirm

- [ ] Brief deadline is sent as the **end of the picked local day** (ISO). Today is allowed until midnight.
      Matches `isDeadlinePassed` (end of day local). Check the API accepts it ("in the future").
- [ ] BriefForm: empty budget with "Open to offers" unticked is an error (forces an explicit choice).
- [x] Mockup texts that contradicted D-05 / D-30 (BriefForm.html deadline hint, MyBriefs.html note) are fixed.
- [ ] Admin reopen of a brief whose deadline passed sends `briefDeadline: null` (no dialog for admins)
- [ ] Admin "delete" on a member sets `memberStatus: DELETE`; admins themselves get no actions
- [ ] `/admin` redirects to `/admin/members`
- [x] `/dashboard` sends a USER to `/dashboard/briefs` (replace). — covered by CreatorOverview.test (redirect once, no loop).
- [ ] Follow buttons on lists use one "who I follow" query (first 100). More than 100 follows → some cards
      show "Follow" until the profile is opened (profile uses `meFollowed`).
- [ ] Brief and comment business messages are matched in the feature (`BriefErrorMessage`,
      `SELF_SUBSCRIPTION_MESSAGE`), not in `shared/lib/errors.ts` — move them there if preferred.

## 3. New test suites

- S4: `briefs/lib/{listQuery,detail,prefetchBriefDetail}.test.ts`, `briefs/components/{BriefsCatalog,BriefDetail}.test.tsx`,
  `comments/lib/comments.test.ts`, `comments/components/CommentsSection.test.tsx`
- S5: `briefs/lib/{myBriefs,briefForm}.test.ts`, `briefs/components/manage/MyBriefs.test.tsx`, `briefs/components/form/BriefForm.test.tsx`
- S6: `creators/lib/{creatorsQuery,profile}.test.ts`, `creators/components/{CreatorsCatalog,MemberProfile}.test.tsx`

- S7: `account/lib/accountForm.test.ts`, `account/components/PasswordForm.test.tsx`, `agents/components/saved/SavedAgents.test.tsx`

- S8: `community/lib/{articles,chat}.test.ts` (no component tests yet: the chat needs a WebSocket mock)

- S9: `admin/lib/admin.test.ts`

- S10: `seo/sitemap.test.ts`

## 4. Browser walk-through

### S4 Briefs
- [ ] `/briefs`: tabs, category chips, search (debounced), sort note for budget/deadline sorts, pagination
- [ ] `/briefs/<id>` as guest: contacts prompt, "Log in to comment"; as member: contacts, post + delete own comment,
      header count and list update; closed brief: no box, note shown; deleted id → 404

### S5 My briefs
- [ ] `/dashboard/briefs` as USER: tabs with counts, Close, Reopen (expired deadline → dialog), Delete (confirm)
- [ ] New / edit form: validation, Open to offers disables budget, past stored deadline does not block a normal edit
- [ ] CREATOR / ADMIN on these pages → 404 page from RequireRole

### S6 Creators
- [ ] `/creators`: search, sorts, Follow toggles (guest → login)
- [ ] `/members/<id>`: creator → agents tab, user → open briefs tab, followers / following tabs, own profile has no Follow,
      blocked member shows the note and no Follow

### S7 Dashboard: settings, favorites, visited, follows
- [ ] `/dashboard/settings`: upload / remove picture, edit nick (taken → error under nick + phone), phone with spaces is
      normalized, clear email → saved as empty, header avatar/name update after save; change password (wrong current,
      same as current, mismatch)
- [ ] `/dashboard/favorites`, `/dashboard/visited`: like an agent → it appears; pause it from another account → it disappears
- [ ] `/dashboard/follows`: creator opens on Followers, user on Following; unfollow from the list

### S8 Community
- [ ] `/community`: category chips, search, write button (guest → login), chat: guest reads only, member sends, 1 s cooldown,
      error under the input, reconnects after login / logout, online count
- [ ] `/community/<id>`: like toggle, comments (ARTICLE group, counter), owner sees Edit
- [ ] `/dashboard/articles`: own list, edit, delete (confirm); new article with and without an image

### S9 Admin
- [ ] As ADMIN: each table filters by status; pause / resume / close / reopen / delete; remove only on DELETE rows, with confirm
- [ ] Block a member → their next request logs them out with the blocked notice (B17)
- [ ] As CREATOR / USER: `/admin/*` shows the 404 from RequireRole

### S10 Home, static pages, SEO
- [ ] `/`: hero search → `/agents?q=…`, category links, top agents / latest briefs / top creators (sections hide when empty)
- [ ] `/faq`, `/about` in en / ko / uz
- [ ] `/sitemap.xml` and `/robots.txt` (robots says `Disallow: /` outside production)
- [ ] Footer links to /faq and /about now resolve

## 5. Phase 6 (written, not run)

- [x] `docs/ci.yml` → move it to `.github/workflows/ci.yml` (the remote tools can't write into .github): install → typecheck → lint → test → build, 20 min timeout. Push a branch to see it run. — moved; still to see it run on GitHub.
- [x] `README.md` rewritten (setup, env table, scripts, structure, deploy).
- [ ] Still open, need a terminal: Playwright e2e (new dependency — decide first), lazy notistack, Noto Sans KR
      weight (measure `.next` CSS first), `@types/node` bump, product comments on paused agents (owner view hides the box).
- [x] AgentDetail now shows real comments (S4 component, PRODUCT group) and a Follow button in the creator box;
      `AgentDetail.test.tsx` expects the "Questions and answers" heading.

## 6. Decided limit changes (backend first, then client)

Decided 2026-10-20 during the browser walk-through: the Nestar-era limits are too short for AgentsHub.

| Field | Now | New | Backend (Step 13a) | Client after the backend change |
|---|---|---|---|---|
| `commentContent` | 1–100 | 1–1000 | comment DTO `@Length`, model `maxlength`, tests, FRONTEND_MIGRATION §3.8 | `COMMENT_MAX` in `features/comments/lib/comments.ts` |
| Chat message | 1–500 | 1–3000 | socket gateway check + its error message, §3.11 | `CHAT_MESSAGE_MAX` in `features/community/lib/chat.ts`; `community:chat.errors.length` text (en/ko/uz) |
| `articleContent` | 3–250 | 3–3000 | board article DTO/model, tests, §3.10 | `ARTICLE_CONTENT_MAX` in `features/community/lib/articles.ts`; `community:form.contentHint` and `community:form.errors.contentLength` texts (en/ko/uz) |

- [ ] Backend changed and deployed locally
- [ ] Client constants + locale texts updated (texts with fixed numbers → use `{{max}}` so this never needs a text change again)
- [ ] `articleTitle` stays 3–50 (not changed)
