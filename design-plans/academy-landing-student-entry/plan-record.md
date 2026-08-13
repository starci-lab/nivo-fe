# Plan record — `case-academy-entry`

nivo expert academy: the public landing, the academy chrome, and the route a member enters through.
Version 2, written 2026-08-13. Lock: [`context-lock.plan.json`](context-lock.plan.json).
Evidence ledger: [`evidence-ledger.md`](evidence-ledger.md).

**This supersedes a version-1 record** that `verify_plan_record.mjs` refused on nine counts — no
`caseId`, no `contextLock`, no `directionLab`, no `stateManifest`, and zero recorded directions. It
was therefore never valid to route to Preview, which is why Preview never ran. Its selection is
carried forward rather than discarded: L-A returns as **E-A**, the parity-first posture.

## What the evidence settled before any direction was drawn

**Two backends, and the old record read the wrong one.** The academy API exposes exactly `signIn`,
`signOut`, `exchangeOauthCode` and `refreshSession`. `signUp`, password reset and all four
two-factor resolvers exist **only** under `src/features/core/` — the control plane. Three states the
version-1 record marked *required* are therefore reclassified `not-applicable` **with the schema
evidence attached**, because a state that quietly disappears cannot be told apart from one nobody
thought of.

**No `signUp` is not a gap.** Both lanes create the member themselves: a brand-new identity through
either OAuth or the password grant lands as `role=member, status=active`, and an email matching a
seeded admin row migration-links onto it. A refusal writes nothing — no cookie, no member.

**OAuth leads, and the registry already said so.** `auth.e2e-spec.ts:231` names
`exchangeOauthCode` *"the login"*, and `auth-entry-stack` encodes the order in its own `why`:
shortcuts closed by an OR divider above, credential form below. Nothing here was a layout preference.

## Work items

| id | scope | target | incumbent |
|---|---|---|---|
| `page-academy-landing` | page | `apps/expert/src/app/[locale]/page.tsx` | **live**, built outside this pipeline |
| `page-academy-entry` | page | `apps/expert/src/app/[locale]/sign-in/page.tsx` | none — genuinely net-new |
| `layout-academy-chrome` | layout | `apps/expert/src/academy/AcademyChrome.tsx` | **live**, built outside this pipeline |

`page-academy-entry` was `page-academy-auth` at `app/dang-nhap/page.tsx`. The segment is `sign-in`,
matching `apps/app/src/app/(auth)/sign-in` already in this monorepo, and the tree moved under
`[locale]/`.

## Directions

| | posture | new owners | address | landing behind |
|---|---|---:|---|---|
| **E-A** | parity-first | 0 | `/sign-in` | no |
| **E-B** | bold | **1 — `ModalShell`** | none | yes |
| **E-C** | balanced | 0 | `/sign-in` | yes, muted |

E-B is expensive for a structural reason, not an aesthetic one: `@nivo/ui` has **no `shells/` folder
and no modal, dialog, drawer or overlay contract anywhere**. Canon permits a shell — it is the named
exemption that may expose `children` — but it must be proposed, built and reviewed. And OAuth breaks
its own premise: the browser really does leave, so returning must reopen the panel, which needs a
flag in the URL — a route by another name.

Lab: `direction-lab/`, served at `http://127.0.0.1:8095/`, every canvas labelled
`DIRECTIONAL — NOT AN APPLY BASELINE`.

## Selection — `E-AB`, explicit

`selectedDirectionId: E-AB`, `selectionKind: **explicit**`.

An earlier pass recorded `E-A` as `default-after-ambiguity`, because *"lam EA va EC"* did not resolve
into one of the three offered directions and the binary re-ask came back about the destination
instead. The user then said it plainly: *"ý là làm cả 2 hiểu k, E-A là trang riêng /vi/sign-in là
router vào nếu chưa đăng nhập, còn modal vẫn có để quick access đăng nhập nhanh"*, and *"như starci
ấy"*. That is a hybrid, so it becomes **one updated direction** with its traits named — and the
default is gone, replaced by a real choice.

**E-AB — one `AuthenticationPanel`, two hosts.**

| | |
|---|---|
| Retained from **E-A** | a real address at `/[locale]/sign-in`: the guard's redirect target, the link a mail can carry, the address OAuth returns to |
| Retained from **E-B** | a quick-access overlay, so a reader on the landing enters without losing the page |
| Rejected from **E-B** | the claim that entry needs no address — OAuth genuinely leaves the browser, so that lane hands off to the route instead of pretending to stay |
| Rejected from **E-C** | muting the landing behind a route; the overlay covers that need without reopening whether `centred-authentication-page`'s “only task” still holds |

The two hosts cannot drift because there is only one panel. That is not a convention to remember —
it is the composition.

**This shape is not invented.** `starci-academy-fe`, the named reference, already ships all three
pieces: `src/app/authentication`, `src/components/overlays/auth/SignInOverlay` and
`src/components/shells/ModalShell` with `{ isOpen, size?, children?, onDismiss }` and
`meta { shape: "shell", mechanics: true, world: "pure" }`. So `ModalShell` stops being a speculative
new owner and becomes a **port** — and canon already names ModalShell one of the three shells allowed
to expose `children`.

Three ports, no invention: `ModalShell` → `packages/ui/src/shells/`, `AuthenticationPanel` →
`apps/expert/src/components/blocks/auth/`, `SignInOverlay` →
`apps/expert/src/components/overlays/auth/`.

## Decisions the user did settle

- The route segment is **`sign-in`**.
- A successful entry goes to the **academy dashboard**.
- A route needing auth sends an unauthenticated visitor **back to `/sign-in`**.

The last two name a destination that **does not exist yet** — `apps/expert` has no dashboard route
and no guarded route. This case can prove a redirect happens and name where it points; it cannot
render the far end.

## Still unknown

- Whether the incumbent landing already **is** the E-A shape or has drifted from it. No record
  answers this, and it is part of why Plan was re-run.
- Whether a course opens anything. No course-detail route exists, so the landing is not designed as
  though one did.
