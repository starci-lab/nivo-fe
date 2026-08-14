import type { ContractPropValue, ContractSpec, LayoutClassName } from "@nivo/ui"

/**
 * THE CANDIDATE'S LOCAL CONTRACT TABLE - the vocabulary these sealed states are actually drawn from.
 *
 * WHY IT EXISTS AT ALL. `@nivo/ui` types `Tree`, `SurfaceCard` and every `define*` helper against its
 * OWN closed key union, so the six entries this case proposes cannot be passed to the shipped branch
 * at all - not as a cast, not as a widening. The candidate therefore carries this table plus local
 * copies of `Tree` and `SurfaceCard` typed by it. Nothing here is written into `packages/`; the
 * future target path for the six additions and the two extends is
 * `packages/ui/src/contracts/index.ts`.
 *
 * WHY THE ENTRIES ARE SPELLED OUT HERE RATHER THAN SPREAD FROM `console-contracts.ts`, which is what
 * that file's own header proposed. The proposal is correct about intent and wrong about mechanism,
 * and the mechanism is checkable: every contract rule that reads the table reads it TEXTUALLY, not
 * through TypeScript. `readContracts` collects keys with `/^\s{4}"([a-z][a-z-]*)":\s*\{/gm` applied
 * to the brace-balanced body of the `buildContracts({` call, and `contractHostOf` finds an entry with
 * `source.indexOf('"<key>": {')`. A spread element carries no key text, so under a spread:
 *
 *   - `no-unknown-contract-key` sees a table of eight and reports all six new keys as invented in
 *     every file that draws one, which is the 17-error wall this candidate stood behind; and
 *   - `routed-page-is-a-main-landmark` cannot find `host: "main"` on `console-body-main`, so it
 *     reports the landmark as missing on all eleven routes.
 *
 * A rule that reads text can only see text. So the six entries are spelled here, character-identical
 * to `console-contracts.ts`, and that file remains the proposal of record which carries the full
 * reasoning, the rejected variant and the two open questions. The duplication is real and is named in
 * the design record: at Apply both collapse into the one paste into `packages/ui`.
 *
 * WHY THE TABLE IS SHORT. `no-dead-contract-key` resolves this file's repository root to the
 * candidate folder and walks `<candidate>/src` for call sites; the `design-plans/` tree gets no
 * `.artifacts/` exemption. Copying the shipped registry wholesale would report roughly thirty-five
 * keys as drawn by nobody. So the eight shipped entries below are exactly the eight these fifteen
 * files render, reproduced verbatim from `packages/ui/src/contracts/index.ts` at HEAD.
 *
 * THE ONE EDIT MADE TO A REPRODUCED ENTRY, and it is forced rather than chosen: a child slot naming
 * a key this table does not hold resolves through `ContractChild` to `never`, which makes the slot
 * unfillable and takes its whole entry down with it. So `label-row-over-card.body` lists the four
 * bodies present here instead of all eight - a PRUNING, not a narrowing of the shipped entry, which
 * keeps every one of its eight when this vocabulary is pasted into it.
 */

/** The registry builder. A function so keys stay literal without an `as const` at the call site. */
const buildContracts = <const T extends { readonly [K in keyof T]: ContractSpec }>(contracts: T): T =>
    contracts

/**
 * The fourteen nodes this candidate draws.
 *
 * The first six are the case's proposed additions. The last eight are reproduced from the shipped
 * registry so the local `Tree` can type them; their `classes`, `host` and `why` are untouched.
 */
export const CONTRACTS = buildContracts({
    /*
     * ── THE CONSOLE FRAME - PROPOSED ─────────────────────────────────────────────────────────────
     *
     * Three entries admitted together because they are one topology: a standing run of destinations
     * beside a routed body, and the landmark that body opens.
     */
    "sidebar-then-body-app": {
        /*
         * NO HOST, ON PURPOSE. A `nav` here would pull the routed body inside the navigation
         * landmark, which is the opposite of what the sibling relationship is for.
         *
         * NO `gap`, ALSO ON PURPOSE. The union carries no bare vertical-rule token, so the rail and
         * the body meet at a seam and each owns its own inset.
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
         * `min-w-0` IS WRITTEN UNPREFIXED AS WELL AS INHERITED. The parent supplies it only through
         * `md:[&>*:last-child]:min-w-0`, so below the breakpoint nothing stops a long resource handle
         * from pushing this column wider than the viewport.
         */
        classes: ["flex", "min-w-0", "w-full", "flex-col"],
        children: {
            /*
             * A LEAF, NOT A CONTRACT. The framework hands the layout an opaque `ReactNode`, and no
             * `ReactNode` narrows into a `ContractComponent`. LAYOUT-1 says the boundary closes
             * `children` into the contract's `page` leaf immediately, so the entry constrains which
             * ELEMENT the routed body opens rather than which page renders inside it.
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
             * correction the whole revision exists to carry: the permanent overview is not one of the
             * services it stands above.
             */
            home: { leaf: "nav-link" },
            servicesCaption: { leaf: "text", props: { size: "xs", tone: "muted" } },
            service: { leaf: "nav-link", repeats: true, restingCount: 4 },
            accountCaption: { leaf: "text", props: { size: "xs", tone: "muted" } },
            account: { leaf: "nav-link", repeats: true, restingCount: 2 },
        },
        why: "Two of these destinations talk ABOUT the other four rather than standing beside them - the wallet is one account's money across every service and support cuts through all of them - so each run is introduced by a caption a reader hears; a flat list can only say that with order, and order is silent to a screen reader.",
    },

    /*
     * ── THE PAGE MEASURE AND THE TWO BODIES - PROPOSED ───────────────────────────────────────────
     */
    "titled-section-stack-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-4xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            heading: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            lede: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "Each subject on this page asks its own query and answers at its own moment, so they are read straight down at one seam and none may be nested inside another - a section drawn inside its neighbour makes one refusal look like the whole page failing; the measure is capped because a single column of labelled sections run across a desktop loses the start of every next line.",
    },
    "body-with-refusal-note": {
        /*
         * `items-start` IS WHAT SEPARATES THIS FROM `centred-empty-notice`, which centres its column
         * and its text. A refusal is prose the reader is meant to act on rather than a centred
         * absence.
         */
        classes: ["flex", "flex-col", "items-start", "gap-3"],
        children: {
            /*
             * OPTIONAL, AND IT IS THE SLOT THAT MAKES THE BODY EXTEND SUFFICIENT. A section can be
             * refused in one half and answered in the other - the pod status throws while the
             * workspace it belongs to answers normally - so the refusal sits BESIDE what came back
             * rather than replacing it.
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
         * grounds: `identity-kind-status-action-row` is this class list minus `flex-wrap`, and its
         * children string differs where `status` is a badge and `price` is a text.
         */
        classes: [
            "flex", "flex-row", "flex-wrap", "items-center", "gap-3", "w-full",
            "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow",
        ],
        children: {
            identity: { contract: "name-over-handle" },
            kind: { leaf: "badge", props: { tone: "neutral" } },
            price: { leaf: "text", props: { size: "sm" } },
            /*
             * REQUIRED here, where the owned row's action is optional. A catalogue entry with nothing
             * to press is an advertisement rather than an offer.
             */
            action: { leaf: "button" },
        },
        why: "A thing that can be BOUGHT carries a price and exactly one press, which is a different relationship from a thing already owned carrying a lifecycle whose tone changes underneath it; putting the price in a status slot would make an amount of money read as a state a resource can be in, and the row wraps rather than clipping because the price cell is what pushes a phone past the edge.",
    },

    /*
     * ── REPRODUCED FROM THE SHIPPED REGISTRY ─────────────────────────────────────────────────────
     *
     * Verbatim from `packages/ui/src/contracts/index.ts`, except where a note below records the one
     * pruning forced by this table being short, and the two extends this case proposes.
     */
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            /*
             * PRUNED TO THE FOUR BODIES THIS TABLE HOLDS. The shipped entry admits eight; naming one
             * absent from this table would resolve the slot to `never` and make the entry unfillable.
             * `inline-action-run`, `stacked-stat-rows`, `claim-panel-grid`, `progress-row-stack` and
             * `attributed-claim-panel` are dropped here and untouched upstream.
             *
             * `body-with-refusal-note` is EXTEND 1 of this case: a refusal is a third answer beside a
             * body and an emptiness, and a section that cannot draw it has to fall back on the empty
             * notice - which tells the reader nothing was there when the server declined to say.
             */
            body: {
                contract: [
                    "labelled-fact-stack", "fleet-resource-list", "centred-empty-notice",
                    "body-with-refusal-note",
                ],
                leaf: "text",
            },
        },
        why: "The label is held OUTSIDE the surface it names, so a section whose content is itself a set of cards never draws a card inside a card; label and owned surface use the ordinary gap-3 seam while major sections remain farther apart.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            title: { leaf: "heading" },
            end: { leaf: ["button", "see-more-link"], optional: true },
        },
        why: "The control sits at the far end of the title's line so the eye finds the name first and the action second, and it drops under the title rather than squeezing it when the line runs out.",
    },
    "title-with-baseline-fact": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The fact reads as part of the heading sentence, so it sits on the title's baseline and wraps under it instead of pushing the title narrow.",
    },
    "fleet-resource-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            /*
             * EXTEND 2 of this case: the slot admits a second row identity, which is what lets the
             * catalogue and the owned-app list be the SAME row surface.
             *
             * KNOWN TIER MISMATCH, recorded rather than hidden: both are BLOCKS, but a child slot may
             * only name a leaf, a composite or a contract. Declaring them `composite` is what makes
             * the slot expressible today; the tier that is true lives on each component's `meta.shape`.
             */
            resource: { composite: ["fleet-row", "template-offer-row"], repeats: true, restingCount: 3 },
        },
        why: "Rows are compared in one scan, so they share one joined surface and full-width rules rather than sitting in two shelves that would make a difference in what they are look like a difference in importance - which is why the same surface holds a thing already provisioned and a thing still on offer, and why the surface owns its own first and last inset instead of every row remembering it is the last one.",
    },
    "labelled-fact-stack": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            fact: { contract: "label-value-row", repeats: true, restingCount: 4 },
        },
        why: "A column of label-and-figure lines reads as one object only while the space between them is smaller than the space around the whole run - at the section gap they stop being a set of facts about one thing and start looking like separate sections.",
    },
    "label-value-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm" } },
        },
        why: "The label and its figure sit at opposite ends of one line so a column of them reads as a table without being one, and they share a baseline so the figure does not float against its own name.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text-link", props: { size: "sm" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle identifies the name without competing with it, so the two stay in one tight vertical identity stack.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "p-4", "text-center"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
})

/**
 * THE TYPE MACHINERY, re-derived against the LOCAL table.
 *
 * It is a copy of the shipped derivation for one reason that cannot be worked around: every helper
 * in `@nivo/ui/contracts` closes over `packages/ui`'s own `CONTRACTS`, so importing `ChildrenOf`
 * from there would type this candidate's slots against a table that does not contain six of the keys
 * it draws. The DERIVATION is shared; the table it reads is not.
 */

type ChildProps<S> = S extends { readonly props?: infer P }
    ? P extends Readonly<Record<string, ContractPropValue>> ? P : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>

type ContractChild<S> = S extends { readonly contract: infer K }
    ? (K extends ReadonlyArray<infer A> ? A : K) extends infer C extends ContractKey
        ? import("./props").ContractComponent<C>
        : never
    : never

type LeafChild<S> = S extends { readonly leaf: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer L extends string
        ? import("./props").LeafComponent<L, ChildProps<S>>
        : never
    : never

type CompositeChild<S> = S extends { readonly composite: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer C extends string
        ? import("./props").CompositeComponent<C, ChildProps<S>>
        : never
    : never

type OneChild<S> = ContractChild<S> | LeafChild<S> | CompositeChild<S>

type ChildValue<S> = S extends { readonly repeats: true }
    ? ReadonlyArray<OneChild<S>>
    : OneChild<S>

type RequiredChildNames<K extends ContractKey> = {
    [S in keyof (typeof CONTRACTS)[K]["children"]]:
        (typeof CONTRACTS)[K]["children"][S] extends { readonly optional: true } ? never : S
}[keyof (typeof CONTRACTS)[K]["children"]]

type OptionalChildNames<K extends ContractKey> = Exclude<
    keyof (typeof CONTRACTS)[K]["children"],
    RequiredChildNames<K>
>

/** The exact named render record admitted by one contract key. */
export type ChildrenOf<K extends ContractKey> = {
    readonly [S in RequiredChildNames<K>]: ChildValue<(typeof CONTRACTS)[K]["children"][S]>
} & {
    readonly [S in OptionalChildNames<K>]?: ChildValue<(typeof CONTRACTS)[K]["children"][S]>
}

/** Every key in the local table. A key not in this union is a compile error at the call site. */
export type ContractKey = keyof typeof CONTRACTS

/**
 * Read one entry, widened to the shared shape.
 *
 * @param name - The registry key to read.
 * @returns The entry.
 */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/**
 * Resolve one contract into the props its branch places on the real layout node.
 *
 * @param name - The registry key to render.
 * @returns The markers and the class string the frame paints.
 */
export const contractNodeProps = (name: ContractKey) => {
    const spec = contractSpec(name)
    return {
        "data-tier": "branch",
        "data-node": name,
        "data-why": spec.why,
        className: (spec.classes as ReadonlyArray<LayoutClassName>).join(" "),
    }
}
