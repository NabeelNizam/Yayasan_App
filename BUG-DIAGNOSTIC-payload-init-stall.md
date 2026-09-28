# BUG DIAGNOSTIC — Payload 3.78 init stalls 90s–4min on every DB-touching request

**Status:** UNRESOLVED. Needs root-cause fix.
**Severity:** Blocker for Plan 3 (public pages reading the DB). Local dev is unusable for any page that reads Payload.
**Author context:** Diagnosed by an AI agent using the `systematic-debugging` skill. All facts below are **measured**, not assumed. Read the "Evidence log" section before proposing a fix.

---

## 1. Environment (verified)

| Item | Value |
| --- | --- |
| OS | Windows 11 |
| Node | **v22.21.1** (via nvm4w; Node 24 also installed but breaks Payload CLI) |
| Next.js | **16.3.6** (App Router, Turbopack, `next dev`) |
| Payload | **3.78.0** (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`) |
| React | 19.3.0 |
| Package manager | **npm** (repo also has older pnpm references in docs/CI; `package-lock.json` is committed) |
| `"type"` in package.json | `"module"` (ESM) |
| DB | Supabase Postgres (project ref `iobycxyojcfokzrrweot`, region `ap-southeast-1`) |
| Payload in-app | route group `src/app/(payload)`, config `src/payload.config.ts`, tsconfig alias `@payload-config` |

Connection strings in `.env.local` (values redacted):

- `DATABASE_URL` = Supabase **shared pooler, TRANSACTION mode, port 6543** (`aws-0-ap-southeast-1.pooler.supabase.com:6543`)
- `DATABASE_URL_DIRECT` = Supabase **session pooler, port 5432** (same pooler host)
  - NOTE: the true direct host `db.<ref>.supabase.co:5432` is **IPv6-only** and unreachable from this network (`ENOTFOUND`), so migrations use the session pooler.
- `DATABASE_URL_DIRECT_SANDBOX` = same session pooler (second DB reserved for integration tests)

Schema is already applied: **31 tables** created in Supabase + a row in `payload_migrations` (`20260928_094827`, batch 1). Applied via `scripts/apply-sql.mjs` (see "Workarounds already in place").

---

## 2. The symptom

Any HTTP request whose server code calls `getPayload({ config })` (Payload init) and then touches the DB takes **90 seconds, then 2.5 minutes, then 4 minutes** — and the time **grows with each request**. Meanwhile Next's own routing time is ~milliseconds.

Measured via `next dev` request logs (the number after `application-code:` is the slow part):

```
GET /tentang-kami 200 in 90s    (next.js: 2.2s,  application-code: 88s)
GET /tentang-kami 200 in 60s    (next.js: 19ms,  application-code: 60s)
GET /api/timing   200 in 2.5min (next.js: 644ms, application-code: 2.5min)
GET /api/timing   200 in 4.0min (next.js: 9ms,   application-code: 4.0min)
```

Client-side `curl`/`Invoke-WebRequest` sometimes times out at 60–150s even though the server eventually logs `200`, i.e. the response is produced but only after minutes.

**Key signature:** all latency is in `application-code` (our code / Payload init), not `next.js` (framework routing) and not raw network.

---

## 3. What has been RULED OUT (with evidence)

These were each tested directly and are **not** the cause:

1. **Network / DB reachability.** A raw `pg` client against the *same* `DATABASE_URL` completes quickly.

   ```
   pooler 6543 (prepare:false)  : select count(*) from information_schema.tables -> 31 tables in ~338ms
   session 5432 (default)       : 31 tables in ~217ms
   pooler 6543 (2nd run)        : 31 tables in ~204ms
   ```

2. **Pooler mode (transaction vs session).** Re-running `next dev` with `DATABASE_URL` overridden to the **session pooler (5432)** did **NOT** fix it:

   ```
   GET /api/timing 200 in 2.0min (next.js: 325ms, application-code: 120s)
   GET /api/timing 200 in 2.0min (next.js: 6ms,   application-code: 2.0min)
   ```

3. **Payload `push` (dev schema auto-sync).** Earlier, dev boots logged `[Y] Pulling schema from database...` repeatedly. `push` was gated to **local DB only** (`push: NODE_ENV !== 'production' && isLocalDb`). Verified `isLocalDb === false` for the Supabase URL, so `pushDevSchema()` is **not** called. The "Pulling schema" lines disappeared — yet the stall remained.

4. **`psql` in the migrate script.** Already removed; migrations now run via `npx payload migrate` (and, when the CLI hung, via a Node script). Not related to runtime latency.

5. **Boot of Payload inside `/api/health/ready`.** That route was rewritten to use a raw `pg` pool instead of `getPayload` → it now answers in **~0.7s**. So *not booting Payload* is fast; *booting Payload* is what stalls.

---

## 4. Open hypotheses (NOT yet proven)

Ordered by current suspicion. Each is stated so it can be confirmed/falsified independently.

- **H1 — Payload init issues many sequential queries, and something on the Supabase side makes each one wait on a timeout.** `getPayload` builds the schema/registry and runs `createExtensions` + introspection. If one of those queries waits on a ~60s timeout and there are 2+, you get 120s+. Needs per-query timing (not yet captured for the final run — the instrumentation was applied but the confirming run was aborted).
- **H2 — Connection/managed-pool interaction.** `pg_stat_activity` showed `total backends: 13`, states `{active:1, idle:5, null:7}`, and **12 sessions "waiting"**. With the transaction pooler, Payload's `Pool(max:1)` plus pooler-side multiplexing may deadlock/serialize. (Evidence is suggestive but not conclusive — the session-pooler test argues against a pure pooler-mode cause.)
- **H3 — Dev-mode (Turbopack) re-initialization.** Latency grows per request, which hints at accumulation (leaked handles/connections) rather than constant slow work. UNKNOWN whether `getPayload` is re-run per request in dev and whether each run leaks a pool.
- **H4 — A Payload/Drizzle call that is unsupported or slow specifically against Supabase** (e.g. extension creation, advisory locks, `LISTEN/NOTIFY`, session-scoped state), causing retries or a long wait.

**Expected outcome of the fix:** `getPayload({ config })` + one query should complete in well under ~1s locally (comparable to the raw `pg` measurement).

---

## 5. Minimal reproduction (step by step)

Prereqs: Node 22.x, npm, a Supabase project with the schema applied (31 tables). `.env.local` present with the vars listed in §1.

1. Add a temporary timing route — `src/app/api/timing/route.ts`:

   ```ts
   import { getPayload } from 'payload'
   import config from '@payload-config'

   export const dynamic = 'force-dynamic'

   export async function GET() {
     const t0 = Date.now()
     const payload = await getPayload({ config })
     const t1 = Date.now()
     const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
     const t2 = Date.now()
     return Response.json({ initMs: t1 - t0, queryMs: t2 - t1, keys: Object.keys(settings ?? {}).length })
   }
   ```

   (Do NOT name the folder with a leading `__` — Turbopack did not pick it up in testing. Use `api/timing`.)

2. Start the dev server:

   ```powershell
   npm run dev
   ```

3. Hit the route and watch the server log:

   ```powershell
   curl.exe -s -m 300 http://localhost:3000/api/timing
   ```

   Observe: the response body eventually arrives, but the log shows `GET /api/timing 200 in <MINUTES> (next.js: <ms>, application-code: <MINUTES>)`. Run it **twice** — the second is even slower. That is the bug.

4. (Control, proves it is Payload-not-network) Compare against a raw `pg` query to the same DB — it returns in ~200–340ms.

5. (Control, proves it is not the pooler mode) Re-run `npm run dev` with `DATABASE_URL` set to the **session pooler (5432)** — the stall persists.

---

## 6. Evidence to gather next (for whoever fixes this)

The one measurement that was never captured: **per-query timing inside Payload's `connect()`**, to see exactly which awaited call consumes the 120s+. Likely calls to instrument (in `node_modules/@payloadcms/db-postgres/dist/connect.js`):

```js
await pool.connect();                 // line ~7
this.drizzle = drizzle({ ... })       // line ~52
await this.createExtensions();        // line ~107  -> runs CREATE EXTENSION IF NOT EXISTS for each extension
await pushDevSchema(this);            // line ~109  (should be SKIPPED here, push:false)
```

Approach that was started but aborted: temporarily wrap each of the above with `console.log('[INSTR] <stage>', Date.now())` (back up `connect.js` first!), clear `.next`, run one request, and read the ordered timestamps. Also enable Drizzle's logger (`drizzle({ client: this.pool, logger: true, ... })`) to log every SQL statement + duration.

Additional probes worth running:

- `SELECT * FROM pg_stat_activity WHERE datname = current_database();` during a stalled request — look for `wait_event_type`, `query_start`, and long-running queries.
- `SELECT pid, state, wait_event, query FROM pg_stat_activity WHERE state <> 'idle';`
- Whether Supabase's pooler logs (Dashboard → Logs → Postgres) show connection errors/retries during the stall.
- Confirm whether `getPayload()` is called once per request in dev (add a module-level counter log) and whether pool count grows across requests.

---

## 7. Workarounds already in place (do not regress)

- `scripts/migrate.mjs` — runs `npx payload migrate` using `DATABASE_URL_DIRECT`; **no `psql`** (not present on Vercel/CI images).
- `scripts/build-guard.mjs` — runs migrate only when `VERCEL_ENV === 'production'`, then `npx next build`.
- `scripts/{extract-sql,validate-sql,apply-sql}.mjs` — the `payload migrate` CLI **hangs** against the Supabase pooler, so the schema was applied by extracting pure SQL from `src/migrations/20260928_094827.ts` into `docs/sql/01-init-schema.sql` and applying it in a transaction (with a `payload_migrations` ledger insert). This is a workaround for the same family of Supabase-pooler problems; the CLI hang may share a root cause with this stall.
- `src/app/api/health/ready/route.ts` — uses a raw `pg` pool (`SELECT 1`), NOT `getPayload`. Fast (~0.7s). Keep it that way.
- `src/payload.config.ts` — `pool: { max: 1, prepare:false when :6543, ssl }`; `push` local-only; throws if `PAYLOAD_SECRET` missing in production.

---

## 8. Relevant facts about the codebase

- Payload is only reachable through `getPayload({ config })` (Local API). No Prisma; Drizzle is internal to Payload. Do not add another ORM (architecture decision).
- Public pages are being migrated to **server components** that call `getPayload`. The first one (`src/app/(site)/tentang-kami/page.tsx` → `src/features/tentang-kami/getContent.ts`) works functionally (renders defaults / DB values) but is unusable in dev because of this stall.
- Verified *not* the cause: a Next 16 build error about `export const revalidate = <imported const>` — fixed separately by using a **literal** `export const revalidate = 300` (Next 16 statically analyzes segment config).

---

## 9. Definition of done for this bug

1. `GET /api/timing` (and `/tentang-kami`) return in **< ~1s locally** on first hit, and do not degrade on repeated hits.
2. The root cause is identified with a concrete measurement (not a guess), and the fix targets it.
3. `npm run build`, `npx tsc --noEmit`, and `npx vitest run` stay green.
4. No reliance on `psql`; works with Supabase shared pooler; still correct for Vercel serverless (pool max 1, `prepare:false`, ssl).
