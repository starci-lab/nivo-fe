# Design record — app-authentication

**Case** `case-auth` · **direction** `direction-b` · **approved revision** `1.0`
· **approval** `confirmed-restated` — restated as "Thầy duyệt revision 1.0 như đang thấy, hay sửa gì
trước?", answered **`duyệt`**
· **mode** `mixed` · **seal** `sha256:028c341b…add43`

Candidate: `preview-lab/candidate/` · lab: `preview-lab/` → http://127.0.0.1:8100/
Parity baseline: `starci-academy-fe @ 8410a74` — `AuthenticationPanel` + `AuthenticationPage`.

## What was approved

Three routes in one grammar. `SignInPanel` and `SignInPage` are **untouched**. Sign-up and
forgot-password arrive as two panels sharing one code step.

| owner | states | where it goes |
|---|---|---|
| `OtpStep` | `code`, `codeWithNewPassword` | `apps/app/src/components/blocks/auth/OtpStep/` |
| `SignUpPanel` | `details`, `done` | `apps/app/src/components/blocks/auth/SignUpPanel/` |
| `ForgotPasswordPanel` | `details`, `done` | `apps/app/src/components/blocks/auth/ForgotPasswordPanel/` |

Eleven rendered states, each with its own URL, screenshot and runtime proof. Build `exit 0`; canon
lint `exit 0` over **19 files with 55 rules active and `noInlineConfig` on** — checked, because a
clean run from an unmatched glob looks exactly like a clean run.

## What Preview changed about the plan

Plan proposed two new contracts. Reading the named reference's **source** — not its picture — killed
both.

`otp-digit-row` was withdrawn: the reference uses one `Field` with `kind: "code"`, and in nivo that
kind already sets `autocomplete="one-time-code"` and `inputmode="numeric"`. Six single-character
boxes would take that away and give nothing back.

`stepped-panel-header` was withdrawn: the reference has no step counter at all. Its subtitle carries
the **address**, which is the one fact a reader on that step checks. `centred-title-pair` already
holds that pair.

The candidate therefore adds **zero contract keys** — and gains one thing Plan never mentioned: the
**card**. `authentication-panel-card` is only `w-full max-w-sm` in both repositories; the visible
surface comes from `SurfaceFormCard` at the page, which is what `AuthenticationPage/component.tsx:34`
does and what the shipped nivo sign-in screen does not.

## Consolidation verdicts

| owner | nearest kin | verdict | the fact that decides it |
|---|---|---|---|
| `OtpStep` | the code step in both journeys | **extract-composite** | identical down to the cooldown, and the cooldown is the part with a security consequence |
| `SignUpPanel` | `SignInPanel` | **keep-apart** | different domain entity and slot identity — three fields, the third existing only to be compared with the second; a submission opens a *challenge*, not a session |
| `ForgotPasswordPanel` | `SignUpPanel` | **keep-apart** | it carries a constraint neither sibling has: it must never disclose whether an address is registered. Merging it would put a security rule behind a boolean. |

## Open questions — all five waived by the approval

Each was stated with its default and its cost before the approval, and the approval was of revision
1.0 **as shown**.

1. `authentication-panel-card` gains an inset. Cost: the shipped sign-in screen acquires a visible
   card. A scoped CSS rule stands in for it in the candidate; Apply deletes the rule and adds `p-6`.
2. `centred-authentication-page` gains `host: "main"`. Cost: none visually; the shipped route's outer
   element becomes `<main>`.
3. Provider shortcuts on sign-up, **not** on the reset route. Cost: a deliberate divergence from the
   reference, which draws them on all three modes.
4. `TextLink` has no `disabled`, so a cooling-down resend still **looks** pressable for sixty
   seconds.
5. The shipped `resetLinkSent` state stays for now.

## What this approval does NOT close

`signInVerifyOtp` returns `requiresTwoFactor: false` unconditionally while `signIn` gates on
`user.twoFactorEnabled`. Direction-b means nothing in this app calls that path — which removes the
**exposure** and leaves the **hole**. The mutation is in the live schema and anything else that calls
it inherits the bypass.

`OtpChallengeService` reads the wall clock, so the successful resend — a control this candidate draws
— has never been executed by a test.

## Corrections to the plan record, made here rather than left to Apply

The plan said "transport untouched". True of the sign-in path, false of the file:
`modules/api/auth.ts` **gains six OTP operations**. Nothing existing in it changes.

`context-lock.plan.json` was written with unescaped Windows separators, so every path in it parsed
back broken (`D:\Repositories\nivo-fe` → `D:Repositories` plus a newline). Repaired in place with the
reason recorded in the file.

---

Route to `$starci-fe-design-apply` with this sealed record. Apply ports the candidate's exact tree,
contracts, props and copy; it does not reinterpret the screenshots.
