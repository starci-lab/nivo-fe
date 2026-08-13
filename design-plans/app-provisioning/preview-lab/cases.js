/*
 * Review chrome for case-prov, direction dir-c-fleet, revision 1.0.
 *
 * The canvas below loads the EXECUTABLE candidate through `candidateUrl`. There is no `state.html`
 * and no case CSS anywhere in this file, deliberately: those belong to Plan's directional
 * comparison, and `references/executable-spec.md` forbids them as Preview implementation sources.
 * What renders in the frame is the same Next build that `npm run build` produced, importing the
 * same `@nivo/ui` source `apps/app` imports.
 */

window.STARCI_REVIEW = {
  title: "Trang cấp phát — candidate 1.0 (case-prov / dir-c-fleet)",
  phase: "preview",
  deliveryMode: "single",
  mode: "creative",
  caseId: "case-prov",
  revision: "1.0",
  workItems: [{ id: "page-provisioning", scope: "page", target: "nivo-fe/apps/app" }],
  evidence: [
    { source: "candidate build", claim: "`next build --webpack` exited 0; static export in candidate/out." },
    { source: "candidate typecheck", claim: "`tsc --noEmit` reported 0 errors in the candidate, packages/ui, apps/app and apps/expert." },
    { source: "measured DOM", claim: "body background oklch(0.9702 0 0) and card oklch(1 0 0) — the HeroUI token layer resolved, so this is not the bare-HTML failure case-d1 recorded." },
    { source: "nivo-backend ExpertProvisionStatus", claim: "awaiting_dns is 'not an error and not retryable by us'; it is the only state drawn in the warning tone." },
  ],
  cases: [{
    id: "dir-c-fleet",
    title: "Hạm đội — một danh sách, lọc theo loại",
    thesis: "Hai loại tài nguyên chuẩn hoá về một hàng chung; trạng thái là cột, không phải thứ tự đọc.",
    distinction: "Hành động của mỗi hàng suy ra từ trạng thái VÀ loại. Hàng đang cấp phát không có nút — không phải nút mờ.",
    states: [{
      id: "default",
      label: "Populated · 7 tài nguyên · vi · light · 1280px",
      covers: ["page-provisioning:populated", "fleet-row:ready", "fleet-row:active", "fleet-row:awaiting_dns", "fleet-row:provisioning", "fleet-row:failed", "fleet-row:suspended", "fleet-row:not_provisioned"],
      /*
       * ABSOLUTE, AND THAT WAS A REAL DEFECT. Served as `candidate/out/index.html` from the
       * chrome's own root, the frame rendered UNSTYLED: Next's static export writes absolute asset
       * paths (`/_next/...`), which resolve against the chrome origin and 404 there. The frame
       * looked like a component failure and was a serving mistake - the same shape of bug case-d1
       * recorded. The candidate now answers on its own origin, where its asset paths are true.
       */
      candidateUrl: "http://127.0.0.1:8091/",
      proofUrl: "candidate/out/.well-known/starci-preview-default.json",
      stateId: "page-provisioning-populated",
      runtimeProof: {
        candidateDigest: "260999dba606cfbf5cef1b7585b786eb29d8affb06db6558b022fd567963a536",
        stateId: "page-provisioning-populated",
        fixtureSha256: "01af22f3491f8f793b2894ca77892543acd061a0621c4f66a4831e34f0e32e47",
        runtimeFingerprint: "d812f86d2bbcb23459dad50c48333eb7f5819ab21820e392e7ab4469464ad951",
        buildCommand: "next build --webpack",
        buildExitCode: 0,
        buildLogSha256: "7edb6fceb2c26c4b",
        route: "/",
        viewport: "1280x800",
        locale: "vi",
        theme: "light",
        authPersona: "owner (expert, signed in)",
      },
    }],
    stateCoverage: [
      { ownerId: "page-provisioning", state: "populated", coverage: "rendered", scenarioId: "default" },
      { ownerId: "page-provisioning", state: "filtered", coverage: "covered-by", scenarioId: "default", evidence: "the kind filter is live in the frame; selecting Site or Workspace re-renders the same owner" },
      { ownerId: "page-provisioning", state: "empty", coverage: "not-rendered-yet", scenarioId: null, evidence: "owed before approval of a later revision; the fixture has no empty variant" },
      { ownerId: "page-provisioning", state: "loading", coverage: "deferred-to-preview", scenarioId: null, evidence: "plan deferred; skeleton shape still undecided" },
      { ownerId: "page-provisioning", state: "error", coverage: "deferred-to-preview", scenarioId: null, evidence: "query failure, distinct from a resource whose status is failed" },
      { ownerId: "fleet-row", state: "ready", coverage: "rendered", scenarioId: "default" },
      { ownerId: "fleet-row", state: "active", coverage: "rendered", scenarioId: "default" },
      { ownerId: "fleet-row", state: "awaiting_dns", coverage: "rendered", scenarioId: "default" },
      { ownerId: "fleet-row", state: "provisioning", coverage: "rendered", scenarioId: "default" },
      { ownerId: "fleet-row", state: "failed", coverage: "rendered", scenarioId: "default" },
      { ownerId: "fleet-row", state: "suspended", coverage: "rendered", scenarioId: "default" },
      { ownerId: "fleet-row", state: "not_provisioned", coverage: "rendered", scenarioId: "default" },
    ],
    blockTree: "PageProvisioning (candidate)\n├── Tree title-with-end-action        Heading + Button\n├── Tree stacked-stat-rows            StatRow x4\n├── Tree choice-tab-strip             ChoiceTabs\n└── SurfaceListCard fleet-resource-list\n    └── FleetRow x7                    Tree identity-kind-status-action-row",
    candidateFiles: [
      { path: "candidate/src/app/page.tsx", targetPath: "apps/app/src/app/cap-phat/page.tsx", sha256: "ca7a135ac0072c8d" },
      { path: "candidate/src/fixtures/fleet.json", targetPath: "(fixture — not materialized)", sha256: "01af22f3491f8f79" },
      { path: "candidate/src/app/globals.css", targetPath: "(already exists in apps/app)", sha256: "4da66efbfd115abf" },
      { path: "apps/app/src/components/blocks/provisioning/FleetRow/index.tsx", targetPath: "apps/app/src/components/blocks/provisioning/FleetRow/index.tsx", sha256: "written in place under the widened boundary" },
      { path: "packages/ui/src/contracts/index.ts", targetPath: "packages/ui/src/contracts/index.ts", sha256: "written in place under the widened boundary" },
    ],
    contracts: [
      { key: "identity-kind-status-action-row", why: "kind and status are two badges because a row must answer WHAT before WHAT STATE; no glyph, because kind already carries that answer" },
      { key: "fleet-resource-list", why: "two kinds compared in one scan share one joined surface rather than two shelves that would make differing lifecycles look like differing importance" },
      { key: "choice-tab-strip", why: "a single filter axis on the plain choice primitive, because extended-tabs requires an icon per tab and there is no honest glyph for a resource kind" },
      { key: "title-with-end-action", why: "existing — the page title owns its one trailing action" },
      { key: "stacked-stat-rows", why: "existing — a run of stat rows as one typed sequence" },
    ],
    proposals: [
      { kind: "new-contract", id: "identity-kind-status-action-row", status: "implemented in packages/ui under the widened boundary" },
      { kind: "new-contract", id: "fleet-resource-list", status: "implemented" },
      { kind: "new-contract", id: "choice-tab-strip", status: "implemented" },
      { kind: "new-owner", id: "FleetRow", status: "implemented at apps/app/src/components/blocks/provisioning/FleetRow — moved out of packages/ui under LAYOUT-5, which puts a block on the app side of the feature line" },
      { kind: "layout-class", id: "[&>*:first-child]:min-w-0 / :grow", status: "admitted into LayoutClassName; the md: twins already existed" },
      { kind: "exports-map", id: "@nivo/ui ./blocks/* and ./composites/*", status: "NEEDED BY APPLY — the candidate reaches StatRow and FleetRow by relative path because package.json is outside this phase's boundary" },
    ],
    backendEnablers: [
      { id: "counts-by-status", status: "not implemented", note: "the strip currently reads counts from the fixture; without a grouped-count query the numbers go wrong the moment the list paginates" },
    ],
    assumptions: [
      "The signed-in persona owns both their sites and their workspaces.",
      "A row's action is derived from status AND kind.",
    ],
    unknowns: [
      "Tier mismatch, recorded not hidden: fleet-resource-list declares its child slot `composite: \"fleet-row\"` because ContractChildSpec admits leaf | composite | contract and has no `block` kind, while FleetRow's own meta.shape is \"block\". Whether the spec needs a fourth kind is a canon decision.",
      "No screenshot was captured: the browser pane was not displayed, so the frame could not composite. Measured DOM values stand in as evidence and a screenshot is owed before sealing.",
      "The empty state is not rendered in this revision.",
    ],
  }],
}
