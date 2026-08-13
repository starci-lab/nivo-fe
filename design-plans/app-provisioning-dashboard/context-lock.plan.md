# Context Lock — Plan, app-provisioning-dashboard

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | root `CLAUDE.md` router |
| Skill | `starci-fe-design-plan` — `…\skills\starci-fe-design-plan\SKILL.md` | skill discovery |
| Primary target | `nivo-fe`, design-target, `D:\Repositories\nivo-fe` | request + workspace + git |
| Reference | `nivo-backend` @ `e822320` — business truth, read-only | full backend scan |
| Reference | `design-plans\app-signin-dashboard` — prior case, read-only | its `plan-record.json` |
| Reference | `design-plans\app-provisioning` — the shipped sibling screen, read-only | sealed record 1.4 |
| Reference | the trust tree — canon, contracts, FE rule set, read-only | trust router |
| Git identity | branch `main`, worktree `D:\Repositories\nivo-fe`, HEAD `415300f5…`, remote **none** | git |
| Artifact root | `D:\Repositories\nivo-fe\design-plans\app-provisioning-dashboard` | phase convention |
| Write boundary | that artifact root, and nothing else | CONTEXT-LOCK-5 |
| Read-only boundary | all `nivo-fe` source, `nivo-backend`, `starci-academy-backend` | Plan policy |
| Runtime | direction lab on the first free port from 8080, started after this lock is shown | Plan rule |
| Context record | this file and `context-lock.plan.json`; inherits nothing | artifact convention |

No drift. No source file has been written.

## Why this is a Plan run and not a resumed one

`design-plans\app-signin-dashboard` already selected **direction-d** for a case that included a
dashboard, and its `page-dashboard` work item was **blocked at Apply** — the three contracts it
needed live in `packages/ui/src/contracts/index.ts`, which the confirmed write boundary excluded. It
was never rendered.

That selection is also **stale rather than merely unfinished**. Direction-d's thesis was *"the fleet
leads: a reader opens the dashboard to see whether what they run is alive"*, and its tree opens with
`InstanceList`. Since then `/provisioning` shipped and IS that list. Reviving direction-d would give
the account two screens whose first answer is the same one.

So a real choice is open again: **what does a dashboard answer that `/provisioning` does not?** That
is a Plan question, not a bounded repair.
