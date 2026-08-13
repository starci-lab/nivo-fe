# Plan record — app-authentication

**Case** `case-auth` · **status** `direction-selected` · **selected** `direction-b`
· **selection** explicit, `B`
· **mode** `mixed` · **render status** `directional-not-apply-baseline`

Lab: `direction-lab/` → http://127.0.0.1:8098/

Parity baseline: `starci-academy-fe @ 8410a74`,
`src/components/blocks/auth/AuthenticationPanel` — one panel, three modes, two steps each.

## What this case is

`apps/app` can sign a reader in and can do nothing else. There is no way to create an account and no
way back from a forgotten password. The backend grew nine OTP mutations this session and every one of
them is proven by e2e; none of them has a screen. This case gives the two missing journeys a screen,
in the grammar of the named reference.

## Selected: direction-b — keep what shipped, add the two that are missing

`SignInPanel` is approved, wired to the real `signIn` mutation, and rendering six states. Direction B
leaves it exactly as it is. Sign-up and forgot-password arrive as two more panels in the same card
and the same grammar, reached by route rather than by switching a mode in place.

Posture is **conservative**, and the trade the selection accepts is topological: the reference
switches modes inside one card, this navigates between three. Pressing *Tạo tài khoản* changes the
URL instead of the panel's state.

What the selection buys is that nothing already approved is reopened. Direction A would have replaced
`SignInPanel` wholesale; direction C would have removed the password from sign-in entirely.

## Four work items

| id | primary scope | depends on |
|---|---|---|
| `page-sign-in` | page | — |
| `block-otp-step` | block | — |
| `page-sign-up` | page | `block-otp-step` |
| `page-forgot-password` | page | `block-otp-step` |

`page-sign-in` is in the matrix **as unchanged**, so the case records that it was left alone
deliberately rather than forgotten.

`block-otp-step` is the second step of both new journeys. It owns the code entry, the expiry
sentence, the resend control and its cooldown, and the way back to the first step. It knows what a
code *means*; it does not know which journey it is finishing.

## What the backend actually supports

Proven by 25 passing e2e assertions across three suites:

- `signUpInit` → `signUpVerifyOtp` creates the account and opens a session.
- `signIn` takes a password and gates on `user.twoFactorEnabled`.
- `signInInit` → `signInVerifyOtp` exists and works — **and this direction does not use it.**
- `forgotPasswordInit` → `forgotPasswordVerifyOtp` sets a password and returns a **boolean, not a
  session**. Setting a password is not signing in.

Four things the design must not pretend otherwise about:

1. **The reset form must never say whether an address is registered.** The e2e asserts an unknown
   address answers with the same flag, sentence, TTL and mailed code as a known one, and that the
   refusal arrives only *after* the code is proved, wearing the same words an expired challenge
   wears. `page-forgot-password` therefore has **no unknown-address state** — a state here would be
   the leak.
2. **Sign-up can fail at the very end.** `createUser` throws on a 409, at verify, *after* the code is
   spent. A reader can prove an inbox and still be turned away, and that journey needs an answer.
3. **The resend cooldown is sixty real seconds.** `OTP_RESEND_TOO_SOON_EXCEPTION` is proven; the
   control must say what it is waiting for.
4. **Remember-me and the terms checkbox have nothing behind them.** The refresh cookie's `maxAge` is
   a fixed thirty days with no per-request control, and neither repository has a terms or privacy
   route — the reference's own links resolve to nothing. Both are cut, and named as cuts.

## Contracts

| key | status | why |
|---|---|---|
| `centred-authentication-page` | existing, retained | the surface every auth route already sits on |
| `authentication-panel-card` | existing, retained | the reading column the shipped sign-in uses |
| `auth-shortcuts-over-divider` | existing, retained | the divider closes the shortcut choice |
| `otp-digit-row` | **proposed** | a run of single-character boxes reading as **one** value. `form-column` and `label-field-hint` were checked first and both pair one label to one control. NEW. |
| `stepped-panel-header` | **proposed** | a title beside a *position in a journey*. `centred-title-pair` holds a title over prose, which wraps and aligns differently. EXTEND considered and refused. NEW. |

## Backend enablers proposed

| id | classification | why it matters |
|---|---|---|
| `sign-in-verify-otp-honours-totp` | **security regression in existing code** | `signInVerifyOtp` returns `requiresTwoFactor: false` unconditionally while `signIn` gates on `user.twoFactorEnabled`. An account with TOTP enabled signs in through the OTP path **without its second factor**. |
| `otp-challenge-takes-an-injectable-clock` | testability of existing code | the resend control is drawn in the UI and its happy path has never been executed by a test |

The first one needs saying plainly: selecting direction B means nothing in this app calls that path
today. That removes the *exposure* and does not remove the *hole*. The mutation is in the live schema
and anything else that calls it inherits the bypass.

## Unknowns carried into Preview

- Whether sign-up collects a display name. `signUpInit` accepts an optional `name`; the reference
  form does not ask for one.
- What sign-up shows when the address is already registered, given the failure lands after the code
  is spent.
- Whether the OAuth shortcuts belong on the sign-up panel too. `exchangeOauthCode` is one mutation
  for both, and this build completes neither.
- Whether the shipped `resetLinkSent` state is removed once the code journey lands.

## Divergences from the parity baseline, recorded

1. Mode switching is navigation rather than in-place state.
2. No remember-me — the mechanism does not exist.
3. No terms checkbox — the pages do not exist, in either repository.
4. `signInInit` and `signInVerifyOtp`, just built and tested, are unused on the sign-in path.

---

Plan HTML is **DIRECTIONAL — NOT AN APPLY BASELINE**. Preview must rebuild direction-b as an
executable candidate rather than copying the lab.
