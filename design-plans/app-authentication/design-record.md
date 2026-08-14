# Design record — app-authentication

**Case** `case-auth` · **direction** `direction-b` · **approved revision** `1.2`
· **approval** `confirmed-restated` — recorded **retroactively**; see *How 1.2 was approved* below
· **mode** `mixed` · **seal** `sha256:899eedf4…1c1b3f`

Candidate: `preview-lab/candidate/` · lab: `preview-lab/` → http://127.0.0.1:8100/
Parity baseline: `starci-academy-fe @ 8410a74` — `AuthenticationPanel` + `AuthenticationPage`.

## What shipped

**One route. One panel. Four states.**

| owner | states | where it is |
|---|---|---|
| `AuthenticationPanel` | `details`, `code`, `done`, `twoFactorUnsupported` | `apps/app/src/components/blocks/auth/AuthenticationPanel/index.tsx` |
| `AuthenticationPage` | — (drawing half) | `apps/app/src/components/pages/AuthenticationPage/component.tsx` |
| `AuthenticationPage` | — (connected half) | `apps/app/src/components/pages/AuthenticationPage/index.tsx` |
| route | — | `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` |

Fourteen rendered states, each with its own harness URL and screenshot. Build `exit 0` emitting all
fifteen static routes; canon lint `exit 0` over **19 files with 57 rules present, all 57 at `error`,
and `noInlineConfig` on** — the counts are recorded because a clean run from an unmatched glob looks
exactly like a clean run.

The candidate panel and the shipped panel are **byte-identical**, 26 292 bytes. Apply ported the
tree; it did not reinterpret a picture.

## What 1.2 changed, and the fact that decided it

Revisions 1.0 and 1.1 shipped three panels — `SignInPanel`, `SignUpPanel`, `ForgotPasswordPanel` —
plus a shared `OtpStep`, across three routes. The named reference is **one route** whose panel
switches mode in place.

The fact that made them one: **`details`, `code` and `done` are the same three trees in all three
journeys.** What differs is which fields appear inside those trees and which words label them — and
by the reference's own rule, adopted here in 1.0, *a different tree is a state and the same tree with
a different sentence is props*. Three panels were three copies of one state machine.

That also retires `OtpStep` on its own terms. It was extracted in 1.0 because two panels each needed
the code step and its sixty-second cooldown; with one panel there is exactly one of each, and a block
shared by a single caller is a seam kept for its own sake.

The 1.0 verdicts that said *keep-apart* were re-read rather than overruled by convenience.
`SignUpPanel` was kept apart on a different domain entity and a third field existing only to be
compared with the second; `ForgotPasswordPanel` on a constraint neither sibling has — it must never
disclose whether an address is registered. **Both facts are still true**, and both are now props of
one owner: `mode` selects the third field, and the reset journey's conditional subtitle plus its
single refusal sentence carry the non-disclosure rule. A fact expressible as a prop was never a
reason for a second owner; it was a reason for a discriminator.

## Three consequences worth naming

**Remember-me came back.** 1.1 recorded its absence as a divergence from the baseline. The merged
panel draws it on the sign-in mode, defaulted on. The refresh cookie's `maxAge` is still a fixed
thirty days with no per-request control, so the switch records intent and the session lasts the same
either way. It is drawn rather than dropped because making it mean something is one backend change
and the control has to exist before that change has anywhere to land — recorded as an enabler, not
faked.

**The provider shortcut now appears on the reset journey**, which is the exact reverse of open
question 3's answer in 1.0. Nobody decided it: in one panel the shortcut block sits above the divider
inside the single `details` tree, so every mode draws it. That is what the reference does. 1.0's
objection is not refuted — a provider button does not recover this account, it signs the reader into
a different one — so it is carried into **unknowns** rather than treated as settled.

**The divider label is set in capitals** — `HOẶC` / `OR`. It names the choice *between* two ways in
rather than labelling the block below it, and at `sm` muted a lowercase word reads as a caption of the
form underneath.

## Registry deltas actually applied

| key | delta | note |
|---|---|---|
| `centred-authentication-page` | `host: "main"` | open question 2, as proposed |
| `centred-authentication-page` | `+ [&>*]:w-full`, `+ [&>*]:max-w-sm` | **not proposed by Preview** — found at Apply |
| `authentication-panel-card` | `+ p-4` | open question 1, but at `p-4`, **not** the `p-6` the default named |
| `auth-shortcuts-over-divider` | `restingCount 2 → 1` | the 1.1 consequence Apply was left to settle |

The measure delta is the interesting one. `SurfaceFormCard` renders a vendor `Card` and puts the
entry's node *inside* it, so `authentication-panel-card`'s own `max-w-sm` constrains the card's
contents and never the card. Left alone the card was a flex item with no width and shrank to its
longest line — 263 px instead of 384 px, and narrower still in a language with shorter words. The
measure has to reach the element the reader sees a border around. Adding `[&>*]:max-w-sm` to an entry
without also adding it to `LayoutClassName` collapsed the whole table's types and reported as errors
in unrelated files.

`centred-title-pair` gained an optional `mark` slot from a **concurrent** case, not this one. It is
recorded because it reached in here: `ChildrenOf` marks the slot optional but the caller must still
name it, and omitting the key made every `defineContractComponent` in the panel fail to resolve its
overload — reported as unrelated errors about `title`, and it broke one build. The panel now says
`mark: undefined` out loud, which is also a design statement: this surface has no glyph above its
name.

## Integration edits

Added: the panel, both halves of the page, the route mount, six OTP operations in
`modules/api/auth.ts`, and the whole `authentication` namespace in `vi.json` and `en.json` — 59 keys
on each side, checked, because a locale added on one side only is the drift the sweep rule exists to
catch.

Deleted: `blocks/auth/SignInPanel/component.tsx` and the old un-localised `app/(auth)/dang-nhap`
route.

Untouched but now caller-less: `requestPasswordReset` and `resetPassword` survive in the transport
with nothing calling them.

## Screenshots — read this before trusting a pixel

Every state names a file that exists in `preview-lab/screens/`. The export they came from **already
carried the merged panel**: `forgot-password.png` draws the Google shortcut, which no 1.1
`ForgotPasswordPanel` ever did.

Two copy-level edits landed **after** that export. `orLabel` was set in capitals, and the remember-me
row was restored. So five `details` screens — `sign-in`, `sign-in-refused`, `sign-up`,
`sign-up-refused`, `forgot-password` — show a lowercase divider label, and the two sign-in ones show
no remember-me row. Every `code`, `done` and `twoFactorUnsupported` screen is unaffected; neither
edit reaches those trees.

`preview-lab/screens/PRODUCTION-authentication.png`, captured from the shipped route, shows both the
capitalised `HOẶC` and the checked remember-me row.

This is recorded rather than repaired because re-rendering is a Preview action and the session that
brought this record up to 1.2 held a write boundary covering the record only. **It is the one
outstanding item on this case.**

## How 1.2 was approved

Retroactively, and the record says so rather than dressing it up. The merged panel, the single route
and the registry deltas were built, approved in conversation and committed at `9fdf5c3` **before**
this record was brought up to them. No verbatim approval sentence for 1.2 was available to the
session that wrote this entry, so the approval is attested by the shipped commit. Revisions 1.0
(`duyệt`) and 1.1 (`ok dứt apply`) keep the user's own words, and the contrast is deliberate.

## What this approval still does NOT close

`signInVerifyOtp` returns `requiresTwoFactor: false` unconditionally while `signIn` gates on
`user.twoFactorEnabled`. No journey in this design calls that path, which removes the **exposure**
and leaves the **hole**: the mutation is in the live schema and anything else that calls it inherits
the bypass. The merge changed nothing about this — it moved a screen, not a backend door.

`OtpChallengeService` reads the wall clock, and `OTP_RESEND_COOLDOWN_MS` is sixty real seconds, so no
flow reaches the successful resend without sleeping a minute. The control is drawn here, its cooldown
is one of the fourteen sealed screens, and **its happy path has never been executed by any test.**

`TextLink` still has no `disabled`, so a cooling-down resend looks pressable for sixty seconds. The
exact delta is written out in `preview-lab/proposed-contracts.ts` rather than applied.

---

Sealed at revision 1.2. `verify_design_record.mjs` reports `ok: true` both with and without `--seal`.
