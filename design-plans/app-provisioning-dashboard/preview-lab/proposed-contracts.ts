/**
 * PROPOSED CONTRACT ENTRIES for direction-a — exact source, not a sketch.
 *
 * TARGET PATH: `packages/ui/src/contracts/index.ts`, inserted into the `CONTRACTS` table, with each
 * key added to `CONTRACT_KEYS`.
 *
 * WHY THIS FILE EXISTS RATHER THAN THE ENTRIES BEING WRITTEN WHERE THEY BELONG. Preview's write
 * boundary is its own artifact root (CONTEXT-LOCK-6), and `packages/ui` is production source. The
 * previous case hit this exact wall: `app-signin-dashboard`'s apply-progress records that
 * `layout-app-chrome` and `page-dashboard` were BLOCKED because the three contracts they needed lived
 * outside the confirmed boundary. It was resolved by the user widening the boundary, recorded in the
 * design record as a named deviation with `approvedBy: "user"`.
 *
 * WHY THE CANDIDATE CANNOT SIMPLY CARRY ITS OWN REGISTRY. `Tree` imports `contractSpec` statically
 * from `packages/ui/src/contracts`. A candidate-local registry cannot be injected into it, so
 * rendering these nodes artifact-locally would mean copying `Tree` — and a copied frame is a second
 * implementation of the exact machinery this whole system exists to keep single. The candidate would
 * then be proving that a facsimile renders, which is the one thing an executable Preview may not do.
 */

/*
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * 1. THE CONSOLE TOPOLOGY
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 */
export const sidebarThenBodyApp = {
    classes: [
        "flex", "min-h-screen", "w-full", "flex-col",
        "md:flex-row", "md:items-start",
        "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0",
        "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow",
    ],
    children: {
        sidebar: { contract: "sidebar-nav-cluster" },
        body: { contract: "console-body-main" },
    },
    why: "The section list is pinned in width and SURVIVES the body beside it, because which sections exist does not stop being true when the route changes - and chrome that repainted on every link would read as the whole console reloading. Below the breakpoint it stacks above rather than halving the column, where a 288px rail would leave a phone nothing to read. Every class here already exists for `rail-then-main`, which is the same topology one level down; what differs is that this one is the document's frame and therefore holds a landmark rather than a card.",
} as const

/*
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * 2. THE LANDMARK THE FRAMEWORK BOUNDARY OWES
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * NOT AN AFTERTHOUGHT, AND NOT A PRODUCT CHOICE. `routed-page-is-a-main-landmark` refuses a layout
 * that composes its own chrome around `children` without marking the routed page, and it is right to:
 * a console whose sidebar is the first thing in the document gives a screen-reader user no way to
 * skip it. The shipped `/provisioning` page has NO main landmark today - the Apply parity pass
 * measured `document.querySelectorAll("main").length === 0` - and this entry is where that gets fixed
 * for every route at once rather than per page.
 */
export const consoleBodyMain = {
    classes: ["flex", "min-w-0", "grow", "flex-col"],
    host: "main",
    children: {
        page: { leaf: "page" },
    },
    why: "The routed body is the document's one main landmark, and it is marked HERE rather than inside each page because every route under this frame is the same promise to a reader who skips the chrome - a page that had to remember to mark itself would eventually be a page that forgot.",
} as const

/*
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * 3. THE SECTION LIST
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 */
export const sidebarNavCluster = {
    classes: ["flex", "w-full", "flex-col", "gap-2", "p-4"],
    host: "nav",
    children: {
        brand: { leaf: "heading" },
        link: { leaf: "nav-link", repeats: true, restingCount: 4 },
    },
    why: "A `nav` host rather than a div, because this is the console's one set of destinations and assistive technology is entitled to find it by name. The links repeat at a resting count of four so the chrome holds its width while the sections are still arriving - a sidebar that grew as counts landed would push the body sideways on first paint.",
} as const

/*
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * 4. A SECTION PAGE'S FRAME
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * NO `host: "main"` HERE. The frame above already opened the landmark, and a second one inside it
 * would be the ambiguous landmark LANDMARK-5 refuses. This node is a reading measure, not a landmark.
 */
export const titledBody = {
    classes: ["mx-auto", "flex", "w-full", "max-w-4xl", "flex-col", "gap-6", "px-6", "py-6"],
    children: {
        heading: { contract: "title-with-end-action" },
        body: { contract: ["stacked-sections", "label-row-over-card", "centred-empty-notice"] },
    },
    why: "A console section reads straight down at 56rem: wider and the eye loses the start of the next line among rows that are mostly short, narrower and a resource name wraps. The heading carries the section's one primary press, so the reader meets what they can DO before what they have.",
} as const

/*
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * WHAT DOES NOT NEED PROPOSING
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Every LayoutClassName above already exists in the union - the sidebar topology reuses the exact
 * names `rail-then-main` uses, and `max-w-4xl` was admitted for the single-column operations measure.
 * No new class name is requested, which is the difference between a topology the registry can already
 * express and one that needs the vocabulary widened.
 *
 * The resource list keeps `titled-summary-filter-over-body-page` unchanged - it is the parity
 * baseline, sealed at revision 1.4 of the shipped page.
 */
