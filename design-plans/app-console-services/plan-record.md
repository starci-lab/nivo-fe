# Plan record — app-console-services

**Case** `case-console-services` · **status** `direction-selected` · **selected** `direction-b`,
revision 2 · **selection** explicit, `duyet b rev 2` · **mode** `creative`
· **render status** `directional-not-apply-baseline`

Lab: `direction-lab/` → http://127.0.0.1:8110/ — revision 1 kept beside it, collapsed.

## What this case is

`/provisioning` becomes the console, and the console is organised by **service**. Four services —
Ứng dụng, AgentOS, Máy chủ, Tên miền — plus Ví and Hỗ trợ under an account caption.

The correction that shaped it: **Học viện is not a service. It is one template app**, a single
member of an open set. So the destination is *Ứng dụng*, and Học viện is a row inside it. A
destination per template would force a fifth rail entry when template #2 ships and a sixth for #3,
and by then `/hoc-vien` is a published address nobody can move.

## Selected: direction-b, revision 2

A permanent overview above the services is the home — not a last-used-service guess. Five sections,
one per service, each owning its own four network states. Below it, a middle level the first
revision did not have: **the app set**, and how a new app is started from the catalogue.

Three levels: overview → Ứng dụng → one app. The third is deferred to Preview, exactly as revision 1
deferred the four service pages.

## Four work items

| id | scope | depends on |
|---|---|---|
| `layout-console-chrome` | layout | — |
| `page-overview` | page | chrome |
| `page-apps` | page | chrome |
| `page-wallet` | page | chrome |

## Four network states, not one

This is the consequence of dropping the fixture, and it is the largest single change from the
shipped screen. Every block owns **chưa hỏi · rỗng · có · bị từ chối**. The fourth is not defensive
padding: `myAcademySettings` and `myPodOpenclawStatus` **throw** rather than answer, so a refusal is
a result the page must draw.

The shipped `/provisioning` renders `fleet.fixture.json`. Every row and every number on the running
screen is invented, and `apps/app/src/modules/api/` has no data module for any console query.

## What the backend cannot do, drawn honestly

**No count query exists anywhere.** Nothing in any scene states how many apps, sites, domains or
templates there are. The app card names its first members and says out loud that one page of a list
is not a total.

**An app's template identity is not a field.** `ExpertSiteEntity.config.templateKey` is the site's
industry *layout* — `minimal | creator | consultant`. The product template is reachable only through
the nullable `catalogOrder → catalogItem` relation, whose FK is `ON DELETE SET NULL`. The drawing
therefore asserts the **shape** — a kind badge on the row — and refuses to assert a field.

`MyInstance.ram` and `vcpu` are hardcoded null though the columns exist. The domain registrar is
simulated: `addDomain` writes 365 days and `ns1/ns2.nivo.vn`, no price, no WHOIS.

## What the selection cost

Revision 1 needed **5** new contract entries and was chosen partly for being the cheapest of the
three. Revision 2 needs **6 NEW + 2 EXTEND** — **7** if the reviewer holds the old `restingCount`
rule. The whole delta is the catalogue; the third level itself costs nothing. **Backend enablers:
still none.** That is the part of the reason it was chosen that survived intact.

## One agreement it broke

The three directions used to agree that the axis is *service*. Revision 2 breaks that — B now has a
destination that is not a service. If B wins, that question reopens for A and C. It has won, so the
lab's lede records it rather than leaving the old claim standing.

## Carried into Preview as unknowns

- What the app list reads once template app #2 exists: `myExpertSites`, a per-template query, or a
  registry-backed `myApps`. It decides whether the Apps level is one query or a client-side merge
  with N error boundaries. **A separate workstream is designing that registry now.**
- Whether an app standing up is a row in the list or only an order. The row shape survives either;
  its source does not.
- Whether any response exposes a total or a cursor.
- `template` is overloaded: `CatalogItem.templateKey = ai_academy` is the app; `ExpertSiteConfig
  .templateKey` is the layout.
- `restingCount` for `titled-section-stack-page`, now that it serves both a five-section overview
  and a two-section app level.

---

Plan HTML is **DIRECTIONAL — NOT AN APPLY BASELINE**. Preview rebuilds direction-b revision 2 as an
executable candidate rather than copying the lab.
