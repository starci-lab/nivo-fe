import type { ContractChildSpec, ContractSpec } from "@nivo/ui"

/**
 * THE VOCABULARY `case-console-services` PROPOSES, stated as data rather than described in prose.
 *
 * FUTURE TARGET PATH: `packages/ui/src/contracts/index.ts`. Every entry below is written in the
 * exact shape that file's `buildContracts({ ... })` call takes, so materialization is a paste into
 * one table and not a translation. Nothing here is written into `packages/` by this phase - Preview
 * writes artifacts only, and the registry is a shipped surface with shipped callers.
 *
 * HOW THIS FILE IS CONSUMED INSIDE THE CANDIDATE. `Tree`, `SurfaceCard` and `SurfaceListCard` are
 * all typed `<K extends ContractKey>` against `@nivo/ui`'s own closed union, so a key absent from
 * `packages/ui` cannot be passed to them at all. The candidate therefore carries a LOCAL table at
 * `src/contracts/index.ts` and local copies of those three branches, and that table spreads the
 * entries below rather than restating them. This file is the single place their text lives, so the
 * design record, the local table and the eventual `packages/ui` paste cannot drift from each other.
 *
 * WHY THE LOCAL TABLE MUST STAY SMALL, recorded here because it is the constraint that shapes it:
 * `no-dead-contract-key` exempts only paths containing `/.artifacts/`, and this workspace files its
 * labs under `design-plans/`, so the exemption does not apply. `contractSearchRoots` resolves the
 * repository root from the table's own path - `<candidate>` - so only references under
 * `<candidate>/src` count as callers. Copying the shipped registry wholesale would report roughly
 * thirty-five dead keys.
 *
 * THE COUNT, AND THE ONE PLACE THE PLAN RECORD CONTRADICTS ITSELF. `plan-record.md` and the
 * direction lab both say SIX NEW plus TWO EXTEND, and the lab's revision-2 vocabulary list names
 * those six. `plan-record.json` substitutes `sidebar-nav-cluster` for `body-with-refusal-note` and
 * drops the `fleet-resource-list` extend, which totals six-plus-one and matches neither stated
 * figure. This file follows the LAB, for two reasons that can be checked rather than argued:
 *
 *   1. A REQUIRED state becomes undrawable without `body-with-refusal-note`. `refused` carries
 *      `status: "required"` in the state inventory of BOTH `page-overview` and `page-apps`, and
 *      `centred-empty-notice` is the answer to an emptiness, not to a refusal.
 *   2. `sidebar-nav-cluster` is traceable to direction A's inventory and to the sealed provisioning
 *      candidate, where it is a FLAT `{ brand, link[] }` - the exact shape whose reason
 *      `home-services-account-nav` exists to reject. Carrying both puts one entry in the table
 *      whose reason contradicts its parent's.
 *
 * The variant is not discarded. {@link SIDEBAR_NAV_CLUSTER_VARIANT} below is the fallback shape,
 * written out so a reviewer who holds `plan-record.json`'s list can take it without a second pass -
 * and the consequence of taking it is recorded there rather than left to be discovered.
 */

/**
 * The six entries this case adds to the registry.
 *
 * Every class token was checked against `LayoutClassName` before it was written, and the `satisfies`
 * below is what keeps that true: the vocabulary is a CLOSED union, so an unadmitted token does not
 * fail locally - it collapses inference for the whole table and reports as errors in files that look
 * unrelated.
 *
 * TWO TOKENS DELIBERATELY NOT USED, with their reasons, so a later reader does not add them back:
 * `bg-surface` is a member but `no-interaction-class-in-entry` refuses it unless the entry is a band
 * (full width with a top or bottom edge), and a rail with a ground and no bounding edge reports as
 * raised - the honest token for the frame's own ground is `bg-background`. `max-w-app-lg` is
 * declared in the union but the union's own comment records that it has no theme definition anywhere
 * in the repository, so it compiles to nothing at all.
 */
export const CONSOLE_CONTRACT_ADDITIONS = {
    /*
     * ── THE CONSOLE FRAME ────────────────────────────────────────────────────────────────────────
     *
     * Three entries admitted together because they are one topology: a standing run of destinations
     * beside a routed body, and the landmark that body opens. Splitting them would put a frame in
     * the table that nothing can legally sit inside.
     */
    "sidebar-then-body-app": {
        /*
         * NO HOST, ON PURPOSE. A `nav` here would pull the routed body inside the navigation
         * landmark, which is the opposite of what the sibling relationship is for. The `nav`
         * belongs to the destination run alone.
         *
         * NO `gap`, ALSO ON PURPOSE. The union carries no bare vertical-rule token - only the
         * positional `[&>*:nth-child(odd)]:border-r` - so the rail and the body meet at a seam and
         * each owns its own inset. A gap written here would be a second inset on top of two that
         * already exist.
         */
        classes: [
            "flex", "min-h-screen", "w-full", "flex-col",
            "md:flex-row", "md:items-start",
            "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0",
            "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow",
        ],
        children: {
            sidebar: { contract: "home-services-account-nav" },
            body: { contract: "console-body-main" },
        },
        why: "The destinations are a SIBLING of the routed body rather than a wrapper around it, so replacing the body on every press cannot take the way back with it; the rail holds one fixed measure while the body takes every remaining pixel, because a rail that resized to its longest label would move every destination each time the route changed.",
    },
    "console-body-main": {
        host: "main",
        /*
         * `min-w-0` IS WRITTEN UNPREFIXED AS WELL AS INHERITED, and the duplication is the point.
         * The parent supplies it only through `md:[&>*:last-child]:min-w-0`, so below the breakpoint
         * nothing stops a long resource handle from pushing this column wider than the viewport.
         */
        classes: ["flex", "min-w-0", "w-full", "flex-col"],
        children: {
            /*
             * A LEAF, NOT A CONTRACT, AND THIS IS A CORRECTION TO ONE OF THE TWO READINGS THIS
             * PHASE INHERITED. Naming `titled-section-stack-page` here would read well and cannot
             * be satisfied: the framework hands the layout an opaque `ReactNode`, and no `ReactNode`
             * can be narrowed into a `ContractComponent<"titled-section-stack-page">`. LAYOUT-1 says
             * the framework boundary closes `children` into the contract's `page` leaf immediately,
             * and the sealed provisioning candidate does exactly that. It is also what keeps this
             * entry honest about what it constrains - which ELEMENT the routed body opens, not which
             * page renders inside it.
             */
            page: { leaf: "page" },
        },
        why: "The routed body is the document's one main landmark, so it is marked once here for every destination instead of each page remembering to mark itself; it adds no measure, seam or inset of its own because the page inside already owns all three, and a second one written here would pad every route twice.",
    },
    "home-services-account-nav": {
        host: "nav",
        classes: ["flex", "w-full", "flex-col", "gap-2", "px-3", "py-6"],
        children: {
            brand: { leaf: "heading" },
            /*
             * `home` IS ITS OWN SLOT RATHER THAN THE FIRST `service`, and that single line is the
             * correction the whole revision exists to carry: the permanent overview is not one of
             * the services it stands above.
             */
            home: { leaf: "nav-link" },
            servicesCaption: { leaf: "text", props: { size: "xs", tone: "muted" } },
            service: { leaf: "nav-link", repeats: true, restingCount: 4 },
            accountCaption: { leaf: "text", props: { size: "xs", tone: "muted" } },
            /*
             * TWO, UP FROM ONE, and it is the only numeric change revision 2 records against
             * revision 1: the account run holds the wallet and support rather than the wallet alone.
             */
            account: { leaf: "nav-link", repeats: true, restingCount: 2 },
        },
        why: "Two of these destinations talk ABOUT the other four rather than standing beside them - the wallet is one account's money across every service and support cuts through all of them - so each run is introduced by a caption a reader hears; a flat list can only say that with order, and order is silent to a screen reader.",
    },

    /*
     * ── THE PAGE MEASURE, AND THE TWO BODIES ─────────────────────────────────────────────────────
     */
    "titled-section-stack-page": {
        /*
         * `max-w-4xl` RATHER THAN `max-w-6xl`, decided by the union's own comment rather than by
         * taste: it reserves 56rem for a single-column operations page and 72rem for a two-column
         * one. Both destinations this key serves are single-column.
         */
        classes: ["mx-auto", "flex", "w-full", "max-w-4xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            heading: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            /*
             * OPEN, AND FLAGGED FOR APPROVAL RATHER THAN SETTLED HERE. The lab's revision-2 app
             * level draws a full sentence under its title about apps being an open set, and
             * `title-with-baseline-fact` cannot hold it - its `fact` is a short baseline phrase that
             * reads as part of the heading. Either this slot stays, or the drawn sentence shortens
             * into a baseline fact and the slot goes. Nothing else in the case depends on which.
             */
            lede: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            /*
             * OPEN, AND THE PLAN RECORD NAMES IT AS AN UNKNOWN IN ITS OWN WORDS. This key serves a
             * five-section overview and a two-section app level, and `restingCount` is what the
             * SKELETON draws before anything is known. The governing precedent is
             * `auth-shortcuts-over-divider`, whose entry sets it to 1 because leaving it at two
             * would promise a second shortcut that never arrives - a loading state that lies about
             * the screen it is standing in for. Read that way the number must be true on EVERY
             * screen the key serves, so 2 rests short on the overview and fills in, rather than
             * drawing three sections the app level never has. THE NAMED ALTERNATIVE is to split
             * this into two keys, which takes the case from six new entries to seven. That is the
             * difference between the two counts the record advertises, so it is a reviewer's
             * decision and not a builder's.
             */
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "Each subject on this page asks its own query and answers at its own moment, so they are read straight down at one seam and none may be nested inside another - a section drawn inside its neighbour makes one refusal look like the whole page failing; the measure is capped because a single column of labelled sections run across a desktop loses the start of every next line.",
    },
    "body-with-refusal-note": {
        /*
         * `items-start` IS WHAT SEPARATES THIS FROM `empty-notice-stack`, which centres its column
         * and its text. A refusal is prose the reader is meant to act on rather than a centred
         * absence, and four existing entries already wear the bare `flex flex-col gap-3` list.
         */
        classes: ["flex", "flex-col", "items-start", "gap-3"],
        children: {
            /*
             * OPTIONAL, AND IT IS THE SLOT THAT MAKES THE EXTEND BELOW SUFFICIENT. A section can be
             * refused in one half and answered in the other - the pod status throws while the
             * workspace it belongs to answers normally - so the refusal sits BESIDE what came back
             * rather than replacing it. Without this slot the same drawing would need
             * `label-row-over-card` to admit a RUN of bodies, which reopens `SurfaceCard`'s
             * projection for a shape this slot already expresses.
             */
            answered: { contract: ["labelled-fact-stack", "fleet-resource-list"], optional: true },
            note: { leaf: "text", props: { size: "sm", tone: "muted" } },
            recovery: { leaf: "button", optional: true },
        },
        why: "A subject that was REFUSED is not a subject that came back empty, so the server's own already-translated sentence sits left-aligned beside whatever part did answer instead of replacing it with a centred apology; the way forward is optional because the two refusals nivo actually throws are the ordinary result of a customer who bought more than once, not a fault to retry.",
    },
    "template-offer-row": {
        /*
         * THE ENTRY CLOSEST TO `no-duplicate-entry-shape`, and it clears it on two independent
         * grounds rather than one. `identity-kind-status-action-row` is this exact class list minus
         * `flex-wrap`, with slots identity/kind/status/action. The classes differ, AND the children
         * string differs where `status` is a badge and `price` is a text. The `props` literals and
         * `restingCount` are read past by the rule's slot reader, so the neutral tone on `kind` is
         * NOT what saves it; the class list and the slot identity both are.
         *
         * `flex-wrap` also answers, for this new row only, the narrow-viewport overflow the lab
         * records as inherited baseline debt - the price cell is what pushes the row past the edge.
         * It does not fix the existing row, which is a separate bounded repair and out of scope.
         */
        classes: [
            "flex", "flex-row", "flex-wrap", "items-center", "gap-3", "w-full",
            "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow",
        ],
        children: {
            /*
             * OPEN, AND RECORDED RATHER THAN CHOSEN SILENTLY. `name-over-handle` puts the catalogue
             * item's slug under its name, which is what the seeded catalogue actually publishes
             * beside the name. The objection worth carrying to the reviewer is that its `name` slot
             * is a `text-link`, and an offer nobody owns yet is not navigable - on that reading the
             * honest child is `subject-over-muted-caption`, whose subject may be a plain heading and
             * whose caption is a tagline sentence. Changing it also adds one key to the candidate's
             * local table, which is why it is a decision rather than an edit.
             */
            identity: { contract: "name-over-handle" },
            kind: { leaf: "badge", props: { tone: "neutral" } },
            price: { leaf: "text", props: { size: "sm" } },
            /*
             * REQUIRED here, where the owned row's action is optional. A catalogue entry with
             * nothing to press is an advertisement rather than an offer.
             */
            action: { leaf: "button" },
        },
        why: "A thing that can be BOUGHT carries a price and exactly one press, which is a different relationship from a thing already owned carrying a lifecycle whose tone changes underneath it; putting the price in a status slot would make an amount of money read as a state a resource can be in, and the row wraps rather than clipping because the price cell is what pushes a phone past the edge.",
    },
} as const satisfies Readonly<Record<string, ContractSpec>>

/**
 * EXTEND 1 of 2 - `label-row-over-card`.children.body, with one value added.
 *
 * TARGET: `packages/ui/src/contracts/index.ts`, the `body` slot of `label-row-over-card`. The eight
 * admitted bodies and the `text` leaf are reproduced exactly as they stand at HEAD so the paste is a
 * replacement rather than a merge somebody has to reconcile by eye.
 *
 * THIS EDIT IS ALSO THE BRANCH EDIT, AND NO BRANCH FILE IS TOUCHED. `SurfaceCard` derives
 * `SectionBodyKey` from this exact union - `(typeof CONTRACTS)["label-row-over-card"]["children"]
 * ["body"]["contract"][number]` - so the branch admits the new body in the same change.
 *
 * BLAST RADIUS ON SHIPPED CALLERS: none. Widening a union of admitted children cannot invalidate a
 * caller that was already passing one of the eight.
 *
 * WHAT IS DELIBERATELY NOT DONE HERE. One reading of this case wanted `body` made repeatable, so a
 * section could draw an answered list AND a refusal sentence beneath it. That is a larger edit - it
 * reopens `SurfaceCard`'s projection, which renders exactly one body - and it is unnecessary,
 * because `body-with-refusal-note` carries an optional `answered` slot for precisely that drawing.
 * The smaller edit is the one the lab and the plan record both describe.
 *
 * The entry's own `why`, its `classes` and its `label` slot are untouched. Its existing comment
 * about `$content` must NOT be carried into any copy of the entry: it still names `stacked-sections`,
 * `dashboard-main` and `dashboard-rail`, all three of which were swept out of the table and no
 * longer exist.
 */
export const LABEL_ROW_OVER_CARD_BODY_EXTEND = {
    contract: [
        "labelled-fact-stack", "inline-action-run", "fleet-resource-list",
        "stacked-stat-rows", "claim-panel-grid", "progress-row-stack", "centred-empty-notice",
        "attributed-claim-panel",
        // A refusal is a THIRD answer beside a body and an emptiness, and a section that cannot
        // draw it has to fall back on the empty notice - which tells the reader nothing was there
        // when in fact the server declined to say.
        "body-with-refusal-note",
    ],
    leaf: "text",
} as const satisfies ContractChildSpec

/**
 * EXTEND 2 of 2 - `fleet-resource-list`.children.resource, admitting a second row identity.
 *
 * TARGET: `packages/ui/src/contracts/index.ts`, the `resource` slot of `fleet-resource-list`.
 *
 * THIS IS THE EXTEND `plan-record.json` OMITS and both `plan-record.md` and the lab require. It is
 * what lets the catalogue and the owned-app list be the SAME row surface, which is the lab's whole
 * argument for the middle level earning its place: two shelves would make a difference in what the
 * rows ARE look like a difference in how important they are.
 *
 * TWO TYPE FACTS CHECKED AGAINST THE SOURCE BEFORE THIS WAS WRITTEN, both of which hold:
 *   - `JoinedListContractKey` requires `divide-y` in the classes, at least one repeated slot, and no
 *     non-repeated slot. One repeated slot is still all there is, so `SurfaceListCard` goes on
 *     accepting the key.
 *   - `CompositeChild<S>` already unwraps arrays - `(N extends ReadonlyArray<infer A> ? A : N)` - so
 *     the slot resolves to a composite of either name with no further type change anywhere.
 *
 * BLAST RADIUS ON SHIPPED CALLERS: none, for the same reason as EXTEND 1.
 *
 * THE TENSION, RECORDED RATHER THAN SMOOTHED OVER: a template offer is not a "fleet resource", so
 * admitting it here strains the registry's first law that a key's name fixes what goes inside it.
 * The alternative is a seventh entry, `template-offer-list`, carrying its own `divide-y` classes -
 * honest, and it costs one entry. The widened `why` below is the case FOR the extend; if the
 * reviewer does not accept that sentence, the seventh key is the answer and this extend is dropped.
 */
export const FLEET_RESOURCE_LIST_EXTEND = {
    /**
     * The widened `resource` slot. `restingCount` is unchanged.
     *
     * KNOWN TIER MISMATCH, recorded rather than hidden: both of these are BLOCKS - one reads nivo's
     * provisioning states, the other reads nivo's catalogue - but a child slot may only name a leaf,
     * a composite or a contract. Declaring them `composite` is what makes the slot expressible
     * today; the tier that is true lives on each component's own `meta.shape`. Whether the spec
     * needs a fourth kind is a canon decision, not one to settle by relabelling a component.
     */
    resource: { composite: ["fleet-row", "template-offer-row"], repeats: true, restingCount: 3 } as const satisfies ContractChildSpec,
    /**
     * The widened reason. The shipped sentence speaks only of "two kinds of provisioned thing", which
     * stops being true the moment the same surface holds something nobody has provisioned yet.
     */
    why: "Rows are compared in one scan, so they share one joined surface and full-width rules rather than sitting in two shelves that would make a difference in what they are look like a difference in importance - which is why the same surface holds a thing already provisioned and a thing still on offer, and why the surface owns its own first and last inset instead of every row remembering it is the last one.",
} as const

/**
 * THE VARIANT, held in reserve - taken only if the reviewer holds `plan-record.json`'s key list over
 * the lab's.
 *
 * It splits the rail in two: the product mark stands outside the destination landmark, and
 * `home-services-account-nav` drops its own `brand` slot and becomes the `destinations` child here.
 * `sidebar-then-body-app.sidebar` then points at this key instead.
 *
 * `host: "aside"` RATHER THAN `"nav"`, and the distinction is the whole reason the variant is
 * survivable at all: `home-services-account-nav` is the `nav`, and nesting a nav inside a nav hands
 * a screen reader two navigation landmarks for one rail.
 *
 * WHAT TAKING IT COSTS, so the choice is made with the bill in hand: `body-with-refusal-note` does
 * not disappear - it becomes a SEVENTH new entry, because `refused` is a required state in two work
 * items and nothing else in the registry draws it. The lab's own count of six is only reachable by
 * leaving this variant out.
 */
export const SIDEBAR_NAV_CLUSTER_VARIANT = {
    "sidebar-nav-cluster": {
        host: "aside",
        classes: ["flex", "w-full", "flex-col", "gap-6", "px-3", "py-6"],
        children: {
            brand: { leaf: "heading" },
            destinations: { contract: "home-services-account-nav" },
        },
        why: "The product's name is not one of the places a reader can go, so it stands outside the destination landmark rather than becoming its first entry, and the seam between them is wider than the seam between two destinations because a mark and a list are two things rather than one run.",
    },
} as const satisfies Readonly<Record<string, ContractSpec>>
