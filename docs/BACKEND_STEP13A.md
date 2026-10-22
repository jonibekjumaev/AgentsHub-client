# Backend Step 13a — prompt for Claude Code (backend repo)

Open Claude Code in `C:\Users\jonik\Desktop\AgentsHub` (the API repo, branch from `develop`:
`git checkout -b feat/step-13a`) and paste the prompt below. Items are ordered by priority; the first three
came out of the client's browser walk-through (2026-10-20/21).

```
Context: the Next.js client (C:\Users\jonik\Desktop\AgentsHub-client) is feature-complete and verified
(codegen, tsc, lint, 479 tests, build). The browser walk-through found API problems. This task is
"Step 13a": fix them in the API. Read CLAUDE.md / AGENTS.md of this repo first and follow them.
The API contract the client relies on is C:\Users\jonik\Desktop\AgentsHub-client\docs\FRONTEND_MIGRATION.md
(read-only for you; update the copy in this repo if there is one, and list contract changes in the report).

Rules:
- Never open or print .env files. No git commit/push.
- Every behaviour change gets a test (unit or e2e, whichever this repo uses for that module).
- Don't change GraphQL names or shapes except where an item below says so; list every schema change in the report.
- Work item by item, in this order. After each item run the affected tests only; run the full test suite and
  the build once at the end (if a run takes longer than 10 minutes, stop it and tell me).

1. CRASH (highest priority). As ADMIN, `getAllMembersByAdmin` hit old Nestar documents
   (`memberType: "AGENT"`, missing `memberBriefs`). GraphQL reported
   "Enum MemberType cannot represent value: AGENT" and "Cannot return null for non-nullable field
   Member.memberBriefs" — and then the whole Node process exited ("Node.js v24.19.0" at the end of the log).
   A field error must become a GraphQL error in the response, never a process exit.
   Find why it exited (logging interceptor / formatError rethrowing, an unhandled promise rejection, a
   process 'uncaughtException' handler that exits, …), fix the cause, and add a test that a resolver
   returning an invalid enum value / null for a non-null field yields an error response while the app keeps
   serving the next request. Also make sure there is a top-level unhandledRejection logger that does not
   swallow errors silently but does not kill the server either (say what you chose and why).

2. LEGACY DATA MIGRATION. Write a one-off script (e.g. apps/agentshub-batch or scripts/, whatever fits the
   repo) that brings Nestar-era documents to the AgentsHub schema:
   - members: memberType AGENT → CREATOR; missing memberBriefs / memberProducts / memberArticles /
     memberFollowers / memberFollowings / counters → 0; memberProperties → memberProducts (if present);
     remove memberAddress; check every other non-null Member field in the GraphQL schema the same way.
   - products / briefs / boardArticles / comments: same check against their non-null fields and enums
     (e.g. CommentGroup PROPERTY → PRODUCT).
   It must default to a DRY RUN that prints, per collection and per rule, how many documents would change,
   and only write with an explicit flag (e.g. --apply). Print the database name it is connected to before
   doing anything. Do NOT run it with --apply yourself — I will, after a backup. Run the dry run and put its
   output in the report.

3. LIMITS (decided). Change the DTO validation, model maxlength and tests, and the error messages that
   mention the numbers:
   - commentContent 1–100 → 1–1000
   - chat message 1–500 → 1–3000 (socket gateway check + its error message)
   - articleContent 3–250 → 3–3000 (articleTitle stays 3–50)
   - memberDesc: no limit today → max 500 (the client form already uses 500)
   Update FRONTEND_MIGRATION §3.8, §3.10, §3.11, §3.1 wording in this repo's copy if there is one.

4. likeTargetProduct / likeTargetMember / likeTargetBoardArticle: return `meLiked` filled for the caller in
   the mutation response (today the client has to write it into its cache itself).

5. Rank position: memberRank and productRank are nightly scores. Expose the position too (e.g.
   `memberRankPosition: Int` / `productRankPosition: Int`, null when unranked), computed in the same nightly
   batch. Nullable, additive — no breaking change.

6. Chat: a member who gets blocked while connected keeps sending messages. Re-check the member's status
   when a message arrives (or on block, close their sockets) and answer like a guest.

7. Uploads: imageUploader errors (bad type, too big, unknown target) must use the error codes from
   FRONTEND_MIGRATION §1.2 (BAD_REQUEST with a stable message), not INTERNAL_SERVER_ERROR.

8. Products: @ArrayMaxSize(10) on productImages (the client allows at most 10) and on productTags
   (the client allows 10) in input and update DTOs.

9. Orphan uploads: a batch job (or documented manual script) that deletes files in uploads/ that no member,
   product or article references and that are older than 24 h. Dry run by default, same as item 2.

10. Remove leftover console.log calls (keep the Logger), and anything else in the repo's own Step 13 notes
    that is still open — list what you found before doing it.

Not now (decided): articleCategory stays non-editable after posting (no BoardArticleUpdate.articleCategory).

Report (English): per item — what changed (files), tests added, schema/contract changes; the migration dry-run
output; full test + build results; anything you could not do.
```

After Claude Code finishes:
1. Backup the members/products/briefs/boardArticles/comments collections (Compass → Export the full collection).
2. Run the migration with `--apply`, then the dry run again (should report 0 changes).
3. In the client repo: `yarn codegen` (new nullable fields), then update the constants and texts in
   `docs/UNVERIFIED.md` section 6 (comment 1000, chat 3000, article 3000), and show the rank position.
