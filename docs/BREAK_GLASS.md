# Break-glass — emergencies for admin mode

Keep a printed or offline copy of this page and your recovery codes. Never store them in the repo or on Vercel.

| Situation | Do this |
|---|---|
| **Lost phone / authenticator** | Log in with password + one **recovery code** (each works once). Then run `node scripts/make-secrets.mjs --totp-only`, scan the new QR code, replace `EDITOR_TOTP_SECRET` + `EDITOR_RECOVERY_HASHES` on Vercel, and redeploy. |
| **Lost phone AND recovery codes** | Same as above, but you skip the login: just regenerate and replace the TOTP secret + recovery hashes on Vercel, then redeploy. Access to your Vercel account *is* the final recovery path, so secure Vercel and GitHub with their own 2FA. |
| **Forgot password** | `node scripts/make-secrets.mjs --password-only` → replace `EDITOR_PASSPHRASE_HASH` on Vercel → redeploy. |
| **Forgot the edit keyword** | `--trigger-only` → replace `NEXT_PUBLIC_EDIT_TRIGGER_HASH` → redeploy (it's a `NEXT_PUBLIC_` var, so a rebuild is required). |
| **Suspect someone else logged in** (unexpected audit-log entries, edits you didn't make) | 1. Rotate `SESSION_SECRET` (kills every session instantly). 2. Rotate the password + TOTP. 3. Review the audit log + History tab and restore any changed items. 4. Export and commit the clean content. |
| **A secret leaked** (pasted in chat, committed, screenshot) | Rotate that secret immediately, as above. If it was committed: rotate first, *then* purge it from git history. Purging alone is not enough. |
| **Upstash data lost / corrupted** | Your last Export (committed `content.export.ts`) is the backup. Copy it over `src/data/content.ts`, deploy, and re-apply any later edits by hand. That's why the editor reminds you to export. |
| **Locked out by rate limit** | Wait out the window (≤ 1 h). Don't try to bypass it. If it's an attack, rotate the password anyway. |
| **Admin mode is broken in prod** | The public site doesn't depend on it. Leave it broken, fix it on a branch, and test it on a Preview deployment with a separate Upstash DB. |

`scripts/make-secrets.mjs` must support the flags `--all` (default), `--password-only`, `--totp-only`,
`--trigger-only` and `--session-only`. It always prints values and never writes them to disk.
