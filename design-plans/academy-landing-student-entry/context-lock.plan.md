# Context lock — plan (re-run)

Case: **nivo expert academy public landing and student auth**
Detected 2026-08-13. Status **confirmed** — the user's words were `ok XÁC NHẬN`, answering a
restatement that the artifact root would be this existing directory, overwriting the version-1
record, rather than a new one.

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan`, re-run to produce a version-2 record | `verify_plan_record.mjs` refuses the version-1 record on nine counts |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | root `CLAUDE.md` router |
| Skill | `starci-fe-design-plan` · `…\.claude\skills\starci-fe-design-plan\SKILL.md` | skill discovery |
| Primary target | `nivo-fe` / `apps/expert` · `D:\Repositories\nivo-fe` | request + workspace + git |
| Git identity | branch `main` · HEAD `415300f` · remote **none** · worktree = git root | `git rev-parse`, `git remote -v` |
| Reference | `nivo/apps/expert/src/components/blocks/landing/LandingPage.tsx` — parity baseline, landing only | `plan-record.json.parityBaseline` |
| Reference | academy API `:3069`, control plane `:3067` — business truth | live GraphQL introspection |
| Reference | `apps/expert/src` — the incumbent implementation, read-only | filesystem |
| Artifact root | `D:\Repositories\nivo-fe\design-plans\academy-landing-student-entry` | same case, lineage kept |
| Write boundary | that directory and nothing else | CONTEXT-LOCK-5 |
| Read-only boundary | `apps/`, `packages/`, the trust tree, `nivo-backend` | Plan is artifact-only |
| Runtime | direction lab from the first free port at `8080`; `:3068`/`:3069` already owned by this session, `:3067` by another chat | CONTEXT-LOCK-5 |
| Context record | this file and `context-lock.plan.json` · **inheritedFrom `null`** | filesystem |

## Why nothing is inherited

There is no `context-lock.plan.json` for this case and `plan-record.json` carries no `contextLock`.
A lock written now and backdated would claim an authority nobody granted, so the absence is
recorded instead of filled in.

## What the version-1 record could not do

`verify_plan_record.mjs` refuses it: no `caseId`, no `contextLock`, no `directionLab`, no
`stateManifest`, wrong `renderStatus`, `selectedDirection` where the schema wants
`selectedDirectionId`, version 1 where 2 is required, no parity-first direction for a `mixed` case,
and **zero recorded directions** — it holds `preliminaryDirections` and a `recommendedDirection`
instead. It was therefore never valid to route to Preview, which is why Preview never ran.

**L-A is carried forward, not discarded.** It re-enters as the incumbent, parity-first direction
with its selection evidence intact — *User replied "ok chốt làm đi" directly to the L-A
recommendation on 2026-08-12*. It is not auto-reselected; the user chooses again against a valid
direction set.

## Drift, named rather than absorbed

| What | Inherited | Detected | Handling |
|---|---|---|---|
| Work-item targets | `app/page.tsx`, `app/dang-nhap/page.tsx` | routes moved under `app/[locale]/` today | new record states the routed paths |
| `page-academy-landing`, `layout-academy-chrome` | not built | **live in production**, built today outside Plan → Preview → Apply | read as the incumbent to compare against, never as an approved baseline |
| `page-academy-auth` | planned | absent from `apps/expert` entirely | the only item of the three that is genuinely net-new |

The middle row is the one worth stating plainly: production was written inside this case's declared
source boundary without a Preview or an Apply. Plan cannot approve that retroactively, and does not
try to. What it can do is make the question answerable — whether the page that exists is L-A, or has
drifted from it.
