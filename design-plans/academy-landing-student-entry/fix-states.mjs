/**
 * Close the state-coverage gaps the first pass left.
 *
 * `state-coverage.md` classifies by OWNER, not by one flat page checklist. The first inventory
 * missed three things because it only thought in pages:
 *
 *   1. `AcademyChrome` is a layout owner and had no inventory at all;
 *   2. interactive blocks owe pending, disabled and focus states;
 *   3. responsive was left blank, and the reference forbids marking it N/A without evidence.
 *
 * Dark mode IS marked not-applicable, and the evidence is real rather than convenient: the palette
 * belongs to the ACADEMY, not to the viewer. One academy in the lab is dark because its expert chose
 * a dark palette. There is no viewer-level toggle to render a second theme for.
 */
import { readFileSync, writeFileSync } from "node:fs"

const PATH = "C:/Users/Hi/AppData/Local/Temp/claude/D--Repositories-starci-academy-backend/2a9087b2-366c-417f-9f11-9716afdd955c/scratchpad/design-academy-pages/plan-record.json"
const j = JSON.parse(readFileSync(PATH, "utf8"))

const landing = j.workItems.find((w) => w.id === "page-academy-landing")
const auth = j.workItems.find((w) => w.id === "page-academy-auth")

landing.stateInventory.push(
    { state: "mobile", status: "required", evidence: "a public academy page is reached from social links on phones; no evidence supports desktop-only" },
    { state: "desktop", status: "required", evidence: "the section grids are authored two- and three-up" },
    { state: "dark-theme", status: "not-applicable", evidence: "the palette belongs to the academy, not the viewer. An expert may choose a dark palette, but there is no viewer toggle to render a second theme for" },
    { state: "lead-form-pending", status: "required", evidence: "the lead submission is a network call and must block a duplicate press" },
    { state: "lead-form-error", status: "required", evidence: "the submission can fail; the page must not claim a lead it did not record" },
    { state: "keyboard-focus", status: "required", evidence: "the lead form and every section button are interactive" },
)

auth.stateInventory.push(
    { state: "mobile", status: "required", evidence: "students arrive from phones; no evidence supports desktop-only" },
    { state: "desktop", status: "required", evidence: "the panel is authored at a fixed measure" },
    { state: "dark-theme", status: "not-applicable", evidence: "same as the landing page: the academy owns the palette, the viewer does not" },
    { state: "already-authenticated", status: "required", evidence: "a signed-in student reaching this route must be sent on rather than shown an empty form; the session cookie exists once refresh has run" },
    { state: "keyboard-focus", status: "required", evidence: "the whole page is a form plus two provider buttons" },
    { state: "provider-disabled-while-submitting", status: "required", evidence: "two entry lanes must not run at once" },
)

j.workItems.push({
    id: "layout-academy-chrome",
    target: "nivo-fe/apps/expert/src/academy/AcademyChrome.tsx",
    primaryScope: "layout",
    subordinateScopes: [],
    dependsOn: [],
    ownerBoundary: "the academy's palette and its own CSS, applied once for every route",
    sourceBoundary: ["apps/expert/src/academy/AcademyChrome.tsx"],
    stateInventory: [
        { state: "provisioned-palette", status: "required", evidence: "the mounted template supplies four named slots plus an accent" },
        { state: "default-palette", status: "required", evidence: "an unprovisioned instance renders the committed default" },
        { state: "second-palette", status: "required", evidence: "a hard-coded colour only fails visibly for the second academy, so one palette proves nothing" },
        { state: "custom-css-applied", status: "required", evidence: "the backend keeps real selectors, so an academy's own CSS can change any section" },
        { state: "custom-css-absent", status: "required", evidence: "most academies never write any" },
        { state: "mobile", status: "required", evidence: "a persistent layout owes responsive coverage" },
        { state: "desktop", status: "required", evidence: "same" },
        { state: "dark-theme", status: "not-applicable", evidence: "the academy owns the palette; there is no viewer-level toggle" },
        { state: "layout-loading", status: "not-applicable", evidence: "the template is mounted at build time, so this layout owns no data that can be pending" },
    ],
})

auth.dependsOn = ["layout-academy-chrome"]
landing.dependsOn = ["layout-academy-chrome"]

j.unknowns.push(
    "U-F: where does an already-authenticated student go when they reach the auth route? No redirect target is proven, and the academy has no dashboard route yet.",
)

writeFileSync(PATH, `${JSON.stringify(j, null, 2)}\n`)
console.log("work items:", j.workItems.length)
for (const w of j.workItems) {
    const req = w.stateInventory.filter((s) => s.status === "required").length
    const na = w.stateInventory.filter((s) => s.status === "not-applicable").length
    console.log(`  ${w.id.padEnd(24)} ${w.primaryScope.padEnd(7)} required=${req} n/a=${na}`)
}
console.log("unknowns:", j.unknowns.length)
