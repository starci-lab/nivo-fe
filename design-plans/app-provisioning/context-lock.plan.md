# Context Lock — plan

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | invoked `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | root `CLAUDE.md` router; git `main` @ `26b9980` |
| Skill | `starci-fe-design-plan` — `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-plan\SKILL.md` | skill discovery |
| Primary target | `D:\Repositories\nivo-fe` — control-plane app `apps/app` (`@nivo/app`) | request + workspace + git |
| Reference | `D:\Repositories\nivo-backend` — read-only business truth for provisioning | `expert-provision`, lifecycle handlers, GraphQL queries |
| Reference | `D:\Repositories\starci-academy-fe` `main` @ `8af51ee` — read-only canon/source anchors | `.claude/INDEX.md` |
| Reference | `D:\Repositories\nivo-fe\design-plans\app-signin-dashboard` — read-only prior approved case `case-d1` | admission evidence |
| Git identity | target: `main`, worktree `D:\Repositories\nivo-fe`, HEAD `415300f`, remote **none** | `git rev-parse`, `git branch --show-current`, `git remote` |
| Artifact root | `D:\Repositories\nivo-fe\design-plans\app-provisioning` | repo convention (`design-plans/<case>`) |
| Write boundary | **only** the artifact root above | CONTEXT-LOCK-5, Plan is artifact-only |
| Read-only boundary | `apps/**`, `packages/**`, both reference repositories, the trust tree | Plan policy |
| Runtime | direction lab, first free port from `8080`, started by this run | phase rule |
| Context record | this file + `context-lock.plan.json`; inherits nothing | artifact convention |

## Admission

Requested: authentication page, dashboard, provisioning page for expert + agentos.

**Refused into Plan, routed elsewhere.** Authentication and dashboard for the control plane are
already settled by `case-d1` in `design-plans/app-signin-dashboard`: three context locks, a design
record, and `apply-progress.md` recording an Apply lock at `confirmed` with the sign-in route built
and measured in a browser. What remains there is not a product choice but two known repairs — project
`SurfaceFormCard` into the `panel` slot, and reopen the write boundary to
`packages/ui/src/contracts/index.ts` so the three approved contracts (`sidebar-then-body-app`,
`titled-body`, `sidebar-nav-cluster`) can be used. Those belong to `starci-fe-fidelity-fix`.
`page-academy-auth` is likewise already `direction-selected` in
`design-plans/academy-landing-student-entry`.

**Admitted.** The provisioning page. No record for it exists in either prior case, and the product
decision is open. Confirmed by the user: one page in `apps/app` covering both resource kinds.

**Deferred, one binary question outstanding.** "Dashboard expert" cannot be placed from evidence:
`page-dashboard` for `apps/app` is already owned by `case-d1`, and `apps/expert` currently has no
pages at all. It is not in this case's work-item matrix and no direction here claims it.
