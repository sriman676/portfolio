# Teju Mode — "I love you" + Proposal Sequence

## 1. Trigger
- Typed in ⌘K: the **normalized** query equals `teju`, so `Teju`, `teju`, `TEJU` and ` Teju ` all work (phones
  auto-capitalize). Normalization: Unicode NFKC → trim → lowercase. Detection is by SHA-256 hash compare
  (`HEART_HASH` constant in `src/components/heart/constants.ts`). Don't put the literal word in source, comments,
  file names or commit messages. Use the neutral name `heart` everywhere in code.
- Generate the hash once in Phase 7 with `node -e "console.log(require('crypto').createHash('sha256').update('teju').digest('hex'))"`
  (the input is the already-normalized word).
- The ⌘K palette closes and the sequence starts. The whole `heart/` folder is a `next/dynamic` chunk loaded
  only on a match, so it adds zero bytes to normal visits.

## 2. Sequence (stays until Yes or close)
| Beat | Duration | What happens |
|---|---|---|
| 0 Hush | 0.6 s | Page content fades to 10% opacity, theme tokens tween to `--love-rose` / `--love-blush`, music starts |
| 1 Heart nebula | 2.5 s | The galaxy warps (streaks) toward empty space, then ~1,500 rose/blush particles from the starfield settle on a heart curve: `x = 16 sin³t`, `y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t`. The heart gently beats (scale 1 → 1.04, ~1.1 s period) |
| 2 "I love you" | 1.5 s | Large text fades and blurs in beneath the heart, in Plex Sans light |
| 3 Love letter | reader-paced | Typewriter reveal of `content.heart.letter` (≈ 35 ms/char). A "Skip ▸" button and tap/Enter complete it instantly |
| 4 Proposal | until answered | "Will you be mine?" with **Yes** and **No** buttons |
| 5a Yes | 4 s, then stays | Heart bursts into ~300 particles, a ring of stars draws around it, then `content.heart.yesMessage` shows. "Close" button |
| 5b No | — | See §3 (playful, never a dead end) |

**Close (×) and Esc work at every beat.** Closing reverses beat 0 over 0.6 s and fully restores the theme.

## 3. The "No" button (playful but accessible)
- Pointer devices: when the cursor comes within ~80 px, No hops to a random in-bounds position (max 6 hops).
  After that it stays put.
- Touch and keyboard (No must stay focusable and activatable, since a11y beats the joke): each activation
  changes its label through `content.heart.noLines` (e.g. "Are you sure?", "Think again 🥺"). Yes grows 10% per
  press up to 1.5×. On the last line, No turns into a second Yes.
- No is never `disabled` and never removed from the accessibility tree before it becomes Yes.

## 4. Sound (default: on, soft)
- A Web Audio synth (no audio file): a slow pad of triangle and sine oscillators through a low-pass filter,
  with a gentle I–V–vi–IV progression in a major key at about 70 BPM. Master gain is ~0.15 with a 1.5 s
  fade-in and fade-out. A small chime plays on Yes.
- It starts inside the keydown/Enter handler, which is a user gesture, so autoplay policies allow it.
- A visible mute toggle (top-right) is remembered in `localStorage` under `heart.muted`. Music stops on close.
- Verify every Web Audio API used (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`,
  `GainNode.gain.linearRampToValueAtTime`) against MDN.

## 5. Reduced motion & fallbacks
- `prefers-reduced-motion`: no particle flight. A static SVG heart appears, the letter shows in full (no
  typewriter), No doesn't hop (label cycling only), and there's no burst on Yes, just the ring as a static SVG.
- No WebGL: the heart is drawn with a 2D `<canvas>` or SVG. The sequence is otherwise identical.
- `role="dialog"`, `aria-modal="true"`, focus moves to the dialog, focus is trapped, and an `aria-live="polite"`
  region announces "I love you" and the proposal question.

## 6. Privacy & content
- Text lives in `content.heart` (`letter`, `yesMessage`, `noLines`). Owner writes it, and it's `TODO(owner)` until
  then. While it's TODO, the trigger does nothing in production.
- **Anyone who types the word will see this, and the letter text ships in a lazy JS chunk that anyone can
  read.** Nothing in it should be private (no surname, address, phone or dates).
- No analytics event and no network request are fired by Teju mode.

## 7. Acceptance
- Typing `teju` (any case, surrounding spaces) triggers it; `tej`, `tejuu` do not.
- The literal trigger string does not appear in `src/`, `app/` or `.next/static` (grep check; `docs/` is exempt). Code uses the neutral
  name `heart`. The owner's own letter text is exempt if it names her.
- The Teju chunk is not requested on normal page loads (verify in the Network tab or a Playwright request log).
- Esc and × work at every beat, and the theme fully restores.
- Keyboard-only users can reach Yes and No, and No eventually becomes Yes.
- 60 FPS on the desktop high tier during beat 1 (report the measured value).
