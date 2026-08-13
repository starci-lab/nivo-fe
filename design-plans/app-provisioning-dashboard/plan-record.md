# Plan record — app-provisioning-dashboard

**Case** `case-console` · **status** `direction-selected` · **selected** `direction-a`
· **selection** explicit, `A đi trò`
· **render status** `directional-not-apply-baseline`

Lab: `direction-lab/` → http://127.0.0.1:8097/

## What this case is

`/provisioning` **becomes** the console. It is not a screen standing beside a dashboard — it is the
console's home. The console is the general management surface for everything an expert runs, in the
shape of a VPS control panel.

## Selected: direction-a — sidebar console

A fixed sidebar of resource **kinds**, a list as the console's home, and a full page per resource.
Light actions ride the row; heavy and destructive ones live on the detail page, where there is room
to say what they do before offering the press.

Posture is **parity-first**, and that is measured against the parity baseline rather than against the
console as a whole: the shipped `/provisioning` list is absorbed with its **sealed anatomy intact** —
same frame key, same `FleetRow`, same filter, same counter strip, same four states. What is added
sits *around* it (a sidebar) and *below* it (a detail route). Direction B would have made the row
learn an expanded state it does not have; direction C would have removed its kind badge and its
action. Only A leaves the approved render untouched.

## Five work items

| id | scope | depends on |
|---|---|---|
| `layout-console-chrome` | layout | — |
| `page-resources` | page | `layout-console-chrome` |
| `page-resource-detail` | page | `page-resources` |
| `page-domains` | page | `layout-console-chrome` |
| `page-billing` | page | `layout-console-chrome` |

## What the backend actually supports

Proven, and the console is built on these: `myInstances`, `myExpertSite`, `myExpertSiteDeployment`
(`publicHost`, `apiPort`, `webPort`, `status`, `lastError`), `myAgentWorkspace`, `opsEvents`,
`myPodOpenclawStatus`, `myDomains`, `myAcademySettings` (a **real live CNAME probe** at query time),
`myWallet`, `myInvoices`, `myCatalogOrders`, and every lifecycle mutation the rows and detail pages
press.

Three things the design must not pretend otherwise about:

1. **`rebuild` / `reprovision` / `wipe` are operator-only** — `POST /api/ops/lifecycle/*` behind
   `PlatformOperatorHttpGuard`. For a customer the danger zone is **absent**, not disabled.
2. **`MyInstance.ram` and `vcpu` are hardcoded `null`** even though `instances.ram_mb` and
   `instances.vcpu` exist. A VPS-shaped row states a machine's size, so this is the smallest enabler
   in the case.
3. **No count query exists anywhere.** The sidebar's per-section counts and the list's counter strip
   are otherwise counted in the browser — correct today, wrong the moment the list paginates.

## Backend enablers proposed

| id | classification | why it matters |
|---|---|---|
| `instance-shape-is-readable` | read projection of existing authorized data | a console that cannot state a machine's size is not a console |
| `counts-by-status` | read projection of existing authorized data | the alternative is a number that silently goes wrong at pagination |
| `operator-read-surface` | **NEW authorization surface — backend design, not a Preview decision** | the danger zone is drawn for an operator who today can only read their own fleet |

## Open questions Preview must settle

- Whether the console's home route stays `/provisioning` or becomes `/resources`. The shipped route
  is `/provisioning`, and renaming it changes an address a customer may already hold.
- Whether `creditBurnUsd` belongs on the resource detail page, on billing, or both. It is
  lifetime-to-date rather than per-cycle, and always `null` for agent workspaces.
- Whether the sidebar's per-section counts earn their cost before `counts-by-status` exists.

## Not claimed

This record claims no visual approval and no executable parity. The lab HTML is a choice instrument
and is never an Apply baseline. Preview rebuilds direction-a as an executable candidate; it does not
copy this mockup.
