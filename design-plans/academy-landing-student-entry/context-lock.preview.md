# Context lock — preview

Case `case-academy-entry`, direction **E-AB**, detected 2026-08-13.
Inherits [`context-lock.plan.json`](context-lock.plan.json).

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `preview` | invoked skill |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | router |
| Primary target | `nivo-fe` / `apps/expert` · `D:\Repositories\nivo-fe` | inherited, redetected |
| Git identity | `main` · `415300f` · remote **none** | `git rev-parse`, `git remote -v` |
| Reference | `starci-academy-fe` — the shape E-AB was taken from | plan record `exactProposals` |
| Reference | `nivo/apps/expert/.../LandingPage.tsx` — parity baseline, landing only | plan record |
| Reference | academy API `:3069` — business truth | live |
| Reference | `apps/expert/src` — the incumbent, read-only | filesystem |
| Artifact root | `design-plans\academy-landing-student-entry` | inherited |
| Write boundary | that directory and nothing else | CONTEXT-LOCK-6 |
| Runtime | candidate hosted from the first free port at `8080`; plan lab still on `:8095` (PID 51440) | phase rule |

## Drift

| What | Inherited | Detected | Verdict |
|---|---|---|---|
| git identity | `main` / `415300f` / no remote | identical | **no drift** |
| target source layout | `components/{pages,layouts,blocks}` | those **plus** `modules/academy/template.ts` and `modules/api/{graphql,academy}.ts` | recorded, not blocking |

The second row is a refactor that landed after the plan lock was written. It does not block Preview,
which writes no production source and reads those modules only as evidence. It is recorded so **Apply
inherits it** and confirms the boundary that actually exists rather than the one Plan described.

## What Preview may not do here

`ModalShell` belongs in `packages/ui/src/shells/`, and `AuthenticationPanel` / `SignInOverlay` in
`apps/expert/src/components/`. All three are outside this phase's write boundary, so their **exact
proposed source is placed in the candidate** and each records its future target path — which is what
the phase is for: the candidate is the thing Apply ports, not a picture Apply interprets.

## Admission

`verify_plan_record.mjs` reports `ok: true` for `case-academy-entry`, with one selected direction
(`E-AB`), `selectionKind: explicit`, four directions, owner boundaries, 38 state-manifest entries,
contracts and business capabilities. Preview proceeds.
