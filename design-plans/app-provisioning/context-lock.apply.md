# Context Lock — Apply, revision 1.4 · **confirmed, materialized**

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `apply` | `starci-fe-design-apply` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | root `CLAUDE.md` router |
| Skill | `starci-fe-design-apply` — `…\skills\starci-fe-design-apply\SKILL.md` | skill discovery |
| Primary target | `nivo-fe`, design-target, `D:\Repositories\nivo-fe` | request + workspace + git |
| Reference | `D:\Repositories\starci-academy-backend\.claude` (read-only) | trust router |
| Git identity | branch `main`, worktree `D:\Repositories\nivo-fe`, HEAD `415300f5…`, remote **none** | git |
| Artifact root | `D:\Repositories\nivo-fe\design-plans\app-provisioning` | phase convention |
| Write boundary | the four paths below, confirmed by the owner | sealed record + declared `integrationEdits` |
| Read-only boundary | everything else in `nivo-fe`, the trust tree, `starci-academy-fe` | evidence role |
| Runtime | `nivo-fe-app` on port 3066, started for parity capture only | preview config |
| Context record | this file and `context-lock.apply.json`; inherits `context-lock.preview.json` | artifact convention |

## Seal

Revision **1.4** · `manifestSha256` `ebdb3221626b22db018624cd0026dc670450040b37478af2814bdef16c89bcc9`

## What was written

```
apps/app/src/components/pages/ProvisioningPage/index.tsx   integrated (3 import specifiers)
apps/app/src/app/provisioning/page.tsx                     integrated (1 import specifier)
apps/app/src/resources/fleet.fixture.json                  materialized, byte-identical
packages/ui/package.json                                   declared integration edit
```

## Apply stopped twice before it wrote anything

Neither stop was patched here. Each returned to Preview, was rebuilt, re-photographed, re-approved
and re-sealed.

| At | Finding | Resolved by |
|---|---|---|
| 1.1 | `candidate.files` named nine targets while two were writable — gate reported missing 5, substituted 4 | 1.2: two targets, seven moved to `notPorted` |
| 1.2 | the target was `app/provisioning/fleet-page.tsx`. A file under `app/` names which page renders at which URL and **nothing else**, and it reached an approval with every gate green because that law was prose no rule read | 1.3 moved it to `components/pages/ProvisioningPage/`, and `starci-fe/route-tree-holds-routes-only` now enforces LAYOUT-6 |
| 1.3 | the page imports a fixture the record gave no target, so Apply would have had to invent a path | 1.4 declared it at `apps/app/src/resources/fleet.fixture.json` |

## Gates

| Gate | Result |
|---|---|
| `verify_design_record.mjs` | `ok: true` |
| `audit-fe-lint-adoption.mjs` | `ok: true` · missing 0 · `refusesInlineConfig: true` |
| `verify_apply_materialization.mjs` | `ok: true` · materialized 1 · integrated 2 · missing 0 · substituted 0 · outOfBounds 0 |
| `tsc --noEmit` app / expert / landing / packages-ui | 0 / 0 / 0 / 0 |
| `next build --webpack` app / expert / landing | 0 / 0 / 0 |
| `npx eslint .` | 1 error — `apps/expert` `AcademySections` needs its presentational twin. Unrelated to this case, agreed as separate work |

## Same-state parity

Same route, 1280×900 at dpr 1, locale `vi`, theme light, owner persona, same fixture hash, captured
through the same headless path the seal used.

| | Sealed | Production |
|---|---|---|
| `data-component` nodes | 73 | 73 |
| first 40 nodes, in order | — | identical |
| action buttons in the list | 6 | 6 |
| badge tones | — | identical |

Seven rows and six buttons: the provisioning row carries no action, which is the optional slot doing
its job rather than a rendering gap.

**Result: pass.** No structural or visual drift.

## Two defects the parity pass found INSIDE the approved design

Both are frozen by the seal and neither was touched here — changing either alters the approved DOM,
and Apply does not edit an approved artifact.

1. **The fixture's status keys do not match the union.** `fleet.fixture.json` spells two statuses in
   camelCase (`awaitingDns`, `notProvisioned`) while `FleetStatus` is snake_case. `STATUS_TONE[status]`
   returns `undefined` for those two, so the *Chờ DNS* badge renders **neutral** where the record's own
   `tokens` line promises **warning** — the one tone the block's comment says is the whole reason the
   map is written out by hand. TypeScript missed it because the JSON is cast with an
   `as ReadonlyArray<Resource>` assertion, which silences exactly that check.

2. **The screen opens no `main` landmark.** `titled-summary-filter-over-body-page` declares no `host`,
   so the outermost node is a `div` and the document has zero main landmarks — a reader cannot skip to
   content. `routed-page-is-a-main-landmark` fires only on a layout that composes chrome; nothing yet
   reports a screen that opens no landmark at all.

Both return to Preview as revision **1.5**, and the second also needs a rule canon does not have.
