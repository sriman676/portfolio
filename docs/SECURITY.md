# Edit Mode — Threat Model & Required Controls

Edit mode is the site's **only** write path. Every control below is mandatory. Run `ecc:security-review` /
`security-reviewer` on Phases 8, 9 and 12, and paste its verdict into the phase report.

## 1. Trust model (be honest about it)
- **The trigger word is obscurity, not security.** Its SHA-256 hash ships in the client bundle. A short
  dictionary word can be brute-forced offline in seconds, and anyone can also call `/api/edit/login`
  directly. Assume attackers know the endpoint.
- **The security boundary is the passphrase, verified server-side**, plus rate limiting and a signed session.
- Teju mode's word hash is public and guessable, and its letter is in the client bundle, so that content is
  treated as public (TEJU_MODE §6).

## 2. Assets & threats (STRIDE)
| Threat | Example | Control |
|---|---|---|
| Spoofing | Brute-force passphrase | Argon2id hash, TOTP, rate limit, lockout, long passphrase (≥ 5 random words) |
| Tampering | Forged session cookie, CSRF write | HMAC-signed cookie, SameSite=Strict, Origin check, POST/PUT/DELETE only |
| Repudiation | "Who changed this?" | Append-only audit log in KV |
| Info disclosure | Secrets in bundle, verbose errors | Server-only env, generic errors, no stack traces in prod |
| DoS | Login flood, giant payloads | Rate limit, body size cap 16 KB, zod max lengths |
| Elevation | Stored XSS via edited content | Text-only rendering, URL allowlist, no `dangerouslySetInnerHTML` |

## 3. Required controls
### 3.1 Passphrase (Argon2id; scrypt fallback)
- **Algorithm: Argon2id**, OWASP Password Storage Cheat Sheet parameters: memory ≥ 19 MiB (19456 KiB),
  iterations ≥ 2, parallelism 1, 16-byte random salt, 32-byte output. Use higher memory if the Vercel
  function limit allows it (measure login latency; target ≤ 500 ms). **Verify these minimums against the
  current OWASP cheat sheet in Phase 0.**
- Implementation, in order of preference (verify in Phase 0 and report which one is used):
  1. Node's built-in `crypto.argon2`, **only if** it exists and is stable in the Node version Vercel runs
     (check the Node docs and `process.version` on Vercel; I'm not certain which version added it).
  2. `@node-rs/argon2` (prebuilt binaries, no node-gyp). Verify the package, its API and that it bundles in a
     Vercel Node function.
  3. Fallback only if both fail: Node `crypto.scrypt` with N = 2^17, r = 8, p = 1, keylen 32. Raise `maxmem`
     accordingly and verify the option names.
- Stored as a PHC-style string, e.g. `EDITOR_PASSPHRASE_HASH=$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`
  (or `scrypt$N$r$p$<salt>$<hash>` for the fallback), so parameters can be raised later without breaking
  verification.
- Compare in constant time (the library's verify function, or `crypto.timingSafeEqual` on equal-length
  buffers). Never store or log the plaintext.
- **Strength rule** in `make-secrets.mjs`: refuse passphrases under 20 characters or under 5 words, and
  offer to generate a random 6-word passphrase. A long passphrase plus TOTP matters more than the algorithm.
- The SHA-256 used for the ⌘K keywords is **only** for hiding them. It is never used for the password.
- `scripts/make-secrets.mjs` (Phase 13) prompts locally for the trigger word and passphrase and prints the
  env values. It never writes them to disk.

### 3.2 Rate limiting & lockout (Upstash)
- `/api/edit/login`: 5 attempts per 15 min per IP, plus 20 per hour globally. After the global limit, lock
  all logins for 1 hour.
- Responses are uniform `401 { error: "invalid" }` with the same latency floor (~400 ms) for wrong passphrase,
  locked state and rate-limited state, so the reason isn't revealed.
- If KV is unavailable in production, **fail closed** (refuse login). The in-memory shim is dev-only and
  must throw if `NODE_ENV === 'production'`.

### 3.3 Session
- On success, set cookie `ed_s` = `base64url(payload).base64url(HMAC-SHA256(SESSION_SECRET, payload))`, where
  payload = `{ iat, exp, nonce }` and exp = 30 min. Flags: `HttpOnly; Secure; SameSite=Strict; Path=/api/edit`.
- Every write route verifies the signature, expiry and `Origin` == `NEXT_PUBLIC_SITE_URL`.
- Logout deletes the cookie and adds the nonce to a KV denylist until it expires.
- `/api/edit/session` returns `{ active: boolean, exp }` only.

### 3.4 Input validation
- A zod schema per item type. Strings are trimmed with max lengths (title 120, blurb 400, body 8,000).
  The slug matches `^[a-z0-9-]{2,60}$`. Arrays are capped (skills ≤ 20, links ≤ 6, metrics ≤ 8).
- URLs: `https:` only, parsed with `new URL()`. Reject `javascript:` and `data:` URLs and credentials in the
  URL.
- Unknown keys are rejected (`.strict()`). Request body cap is 16 KB.
- All content is rendered as text. Case-study `body` supports a minimal Markdown subset (paragraphs, lists,
  inline code, links). Render it with a sanitizing renderer whose API you verify, or a tiny custom parser
  that outputs React elements, never raw HTML.

### 3.5 Routes
| Method | Route | Auth |
|---|---|---|
| POST | `/api/edit/login` | rate-limited |
| POST | `/api/edit/logout` | session |
| GET | `/api/edit/session` | none (returns boolean) |
| GET | `/api/edit/items` | session (includes hidden/tombstoned) |
| GET | `/api/edit/history` · POST `/api/edit/history/[id]/restore` · GET `/api/edit/export` | session (+ Origin for POST) |
| PUT | `/api/edit/items/[slug]` | session + Origin |
| DELETE | `/api/edit/items/[slug]` | session + Origin (KV item → delete; seed item → tombstone) |
| POST | `/api/edit/items/[slug]/restore` | session + Origin |
| PUT | `/api/edit/ordering` | session + Origin (zod: slugs must exist, arrays ≤ 200) |
| POST | `/api/edit/items/[slug]/draft-from-readme` | session + Origin (server fetches README; returns draft, saves only on explicit PUT) |
All routes: `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, and `Cache-Control: no-store`.

### 3.6 Audit log
KV list `audit` (cap 500, newest first): `{ ts, action, slug, ipHash }`. ipHash = SHA-256(ip + SESSION_SECRET),
truncated. No raw IPs.

### 3.8 TOTP second factor (item 12)
- Unlock flow: **trigger word (⌘K) → passphrase → 6-digit authenticator code.** Both are submitted together
  to `/api/edit/login`, and the response is the same generic `401` whichever one is wrong.
- Implement RFC 6238 yourself with Node `crypto.createHmac('sha1', …)`: 30 s step, 6 digits, ±1 step window.
  This avoids an extra dependency. Verify against the RFC 6238 Appendix B test vectors in a unit test.
- Secret: `EDITOR_TOTP_SECRET` (base32, server-only). `make-secrets.mjs` generates it and prints the
  `otpauth://totp/Cosmos:Sriman?secret=…&issuer=Cosmos` URI plus a terminal QR code (use a QR package only
  if verified; otherwise print the URI to paste into the authenticator app).
- **Replay protection:** store the last accepted time-step in KV and reject any code with step ≤ that value.
- Recovery: `make-secrets.mjs` also prints 8 one-time recovery codes. Their Argon2id hashes go in
  `EDITOR_RECOVERY_HASHES` (comma-separated), and a used code is recorded in KV. Owner stores them offline.

### 3.9 Versioning
Every write appends to KV `history` (EXTRAS.md §3). Restore and undo go through the same validated routes.
Export is `GET /api/edit/export` (session required, `Content-Disposition: attachment`).

### 3.7 Headers on edit routes
`X-Robots-Tag: noindex`. Covered by the global CSP.

## 4. Tests (required, Phase 8)
- Unit: TOTP RFC 6238 vectors, ±1 window, replay rejected, recovery code single-use; Argon2id verify (right/wrong,
  tampered params string), cookie sign/verify/tamper/expiry, zod rejects (`javascript:` URL,
  extra key, oversize), slug regex.
- Integration (route handlers): 401 without cookie, 403 bad Origin, 6th login attempt is limited, a
  successful write invalidates the content cache.
- Grep check in CI: the build output (`.next/static`) must not contain `EDITOR_PASSPHRASE_HASH`,
  `SESSION_SECRET` or `UPSTASH_REDIS_REST_TOKEN` values.
