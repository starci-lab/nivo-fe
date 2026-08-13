# Context Lock — preview

Inherits [`context-lock.plan.json`](context-lock.plan.json). Redetected at the start of this run.

| Field | Inherited | Detected now | Drift |
|---|---|---|---|
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | same | none |
| Primary target | `D:\Repositories\nivo-fe` (`apps/app`) | same | none |
| Branch | `main` | `main` | none |
| Worktree | `D:\Repositories\nivo-fe` | same | none |
| HEAD | `415300f` | `415300f` | none |
| Remote | none | none | none |
| Artifact root | `design-plans\app-provisioning` | same | none |
| Case | `case-prov` | same | none |
| Selected direction | `dir-c-fleet` (`explicit`, evidence `C`) | reconfirmed by the user: "C nhé" | none |

**No drift.** Phase proceeds.

| Field | Locked value |
|---|---|
| Phase | `preview` |
| Skill | `starci-fe-design-preview` — `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-preview\SKILL.md` |
| Write boundary | **only** `D:\Repositories\nivo-fe\design-plans\app-provisioning` (CONTEXT-LOCK-6) |
| Read-only boundary | `apps/**`, `packages/**`, `nivo-backend`, `starci-academy-fe`, the trust tree |
| Runtime | executable candidate, first free port from `8080` |
| Context record | this file + `context-lock.preview.json`; inherits `context-lock.plan.json` |
| Status | **`blocked-on-write-boundary`** — see below |

## Runtime feasibility that WAS proven

Module resolution was tested from the candidate location before any file was written:

```
from apps/app  -> D:\Repositories\nivo-fe\packages\ui\src\index.ts
from candidate -> D:\Repositories\nivo-fe\packages\ui\src\index.ts
```

An artifact-local Next app therefore imports the real `@nivo/ui` source, the same way `apps/app`
does (`transpilePackages: ["@nivo/ui"]`). The candidate can be genuinely executable rather than a
facsimile. That half is not the problem.

## The blockage

`ContractKey` is `keyof typeof CONTRACTS` (`packages/ui/src/contracts/index.ts:850`) — a closed
union built from the registry, and its own comment says "A key not in this union is a compile error
at the call site". `Tree` accepts nothing else.

`dir-c-fleet`'s `FleetRow` carries **glyph, name, detail, resource kind, status, action**. Every
existing key was checked against that anatomy:

| key | why it cannot carry the row |
|---|---|
| `glyph-title-fact-row` | three fixed slots, all `icon`/`text`; no badge, no button, no kind |
| `glyph-body-action-row` | glyph + body + action; no badge, no kind |
| `avatar-identity-badge-action-row` | structurally closest — identity, optional badge, button — but its leading leaf is `avatar`, it has no kind slot, and its `why` is about a *suggested identity*, not a provisioned resource |
| `label-with-muted-fact-row` | two text slots only |

The kind slot is not decoration; it is the whole bet of direction C — one row shape that says
whether it is a Site or a Workspace. Folding it into `name-over-handle`'s handle would be exactly
what Plan canon forbids: renaming a domain fact into a generic-looking but false prop to avoid
creating the correct owner.

So the candidate needs one new registry entry, and `packages/ui/src/contracts/index.ts` is
production source that CONTEXT-LOCK-6 forbids this phase from writing.

## This is the second time this exact wall stopped work

`design-plans/app-signin-dashboard/apply-progress.md` records `layout-app-chrome` and
`page-dashboard` blocked for the same reason: three approved contracts
(`sidebar-then-body-app`, `titled-body`, `sidebar-nav-cluster`) live in that same file, outside a
narrowed write boundary. A rule that stops two unrelated cases at the same file is worth deciding
once rather than per case.

Preview stops here and asks. It does not hand-write HTML to imitate the missing owner —
`references/executable-spec.md` lists that among the forbidden substitutes, and a picture that
cannot be built is the one thing Preview exists to prevent from being approved.
