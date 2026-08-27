/**
 * THE REGISTRY.
 *
 * One entry describes ONE node: the classes it wears, and why the things inside it sit that way.
 * Nothing else. What goes inside is the assembling branch's business. A fixed run of independently
 * meaningful leaves is a composite; its count does not turn it back into a leaf.
 *
 * A KEY'S NAME MUST FIX ITS CHILDREN. `card` is not a name here - it says nothing about what goes
 * inside, so anything can, and the entry stops constraining anything. `title-with-baseline-fact`
 * says what it holds, so a wrong child is visible on sight. It is also what keeps `why` honest: a
 * key drawing twenty regions cannot say why any one of them is there, but the reason a title and
 * a fact share a baseline is the SAME reason at all twenty.
 *
 * POSITIONAL SELECTORS ARE ACCEPTED HERE, and only here. Naming a child instead of counting to it
 * would be better, and it died with the children map. The objection stands - insert something in
 * the middle and `nth-child(2)` is silently wrong - but the children now come from ONE branch, so
 * whoever inserts one is looking at this file beside it.
 */

import type { CoreLayoutClassName } from "@starci/grammar/core"

/**
 * The closed set of classes a node may lay its children out with.
 *
 * `gap-[13px]` is not forbidden - it is UNREPRESENTABLE, because it is not a member. That single
 * property is what makes a whole family of patrol rules unnecessary: there is nothing to police
 * when the bad value cannot be typed.
 */
export type LayoutClassName = CoreLayoutClassName
    | "items-baseline"
    | "justify-around" | "[&>*]:w-full" | "[&>*]:max-w-sm"
    | "grid-cols-1" | "grid-cols-2" | "sm:grid-cols-2" | "sm:grid-cols-4" | "sm:grid-cols-5" | "sm:grid-cols-[minmax(0,1fr)_12rem]" | "md:grid-cols-2" | "lg:grid-cols-3" | "lg:grid-cols-4"
    | "lg:grid-cols-[minmax(0,1fr)_20rem]"
    | "lg:grid-cols-[minmax(0,7fr)_minmax(20rem,5fr)]"
    | "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    | "lg:grid-cols-[16rem_minmax(0,5fr)_minmax(0,7fr)]"
    | "lg:grid-cols-[14rem_minmax(0,6fr)_minmax(20rem,4fr)]"
    | "md:flex" | "md:flex-row" | "md:items-start"
    | "mx-auto" | "min-h-screen" | "w-64" | "fixed" | "inset-x-0" | "bottom-0" | "max-w-app-lg" | "max-w-6xl" | "max-w-screen-2xl" | "max-w-sm"
    // The two reading measures between the form width and the dashboard width. `max-w-sm` is a
    // control column and `max-w-6xl` is a two-column page at 72rem; a band of prose read straight
    // down needs 48rem, and a single-column operations page needs 56rem. Neither is expressible by
    // rounding to a neighbour: at `max-w-sm` a paragraph becomes a ladder, and at `max-w-6xl` the
    // eye loses the start of the next line. `max-w-app-lg` is NOT the answer here - it is declared
    // in this union but has no theme definition anywhere in the repository, so it compiles to
    // nothing at all.
    | "max-w-3xl" | "max-w-4xl"
    | "h-16" | "min-h-16" | "top-0" | "top-16" | "z-40" | "z-50" | "lg:sticky" | "lg:top-6"
    | "border" | "border-b" | "border-t" | "border-separator" | "divide-y" | "divide-separator" | "bg-background"
    | "px-3" | "px-4" | "px-6" | "py-2" | "py-3" | "py-6" | "py-8" | "p-0" | "p-2" | "p-4" | "p-6"
    | "px-2" | "md:px-6"
    // THE INTERACTION AND PAINT TOKENS LEFT WHEN THE PRESS TARGET BECAME A BRANCH. A cursor, a
    // hover answer and the colour of set words are claims one node makes about how it REACTS and
    // how it looks, not about how its children stand together, so CONTRACT-12 gives them to the
    // component that owns the handler and the disabled state - `PressableSurface` writes them as
    // its own strings. Left in this union they would stay typeable, and an entry that typed them
    // would go on drawing a pointer over a node whose call site passed no handler, which is the
    // promise the table can never be told is off.
    //
    // `shadow-surface` goes with them for the neighbouring reason: an elevation makes the node a
    // raised OBJECT, and a raised object is the thing the named surface branches draw. The edge
    // tokens stay, because `rounded-*` clips and divides rather than raises, and so does
    // `bg-surface` - a ground with nothing bounding it is a band, which is a shape an entry still
    // owns.
    | "rounded-xl" | "rounded-2xl" | "rounded-3xl"
    | "bg-surface" | "text-center"
    | "[&>*:nth-child(2)]:min-w-0" | "[&>*:nth-child(2)]:grow"
    | "md:[&>*:first-child]:min-w-0" | "md:[&>*:first-child]:grow"
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:shrink-0" | "md:[&>*:last-child]:hidden"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-6"
    | "md:[&>*:first-child]:top-0" | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:max-h-screen" | "md:[&>*:first-child]:w-64"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "md:[&>*:nth-child(2)]:sticky" | "md:[&>*:nth-child(2)]:top-0"
    | "md:[&>*:nth-child(2)]:max-h-screen" | "md:[&>*:nth-child(2)]:w-64"
    | "md:[&>*:nth-child(2)]:shrink-0" | "md:[&>*:nth-child(2)]:overflow-y-auto"
    | "md:[&>*:nth-child(3)]:min-w-0" | "md:[&>*:nth-child(3)]:grow"
    | "[&>*:first-child]:hidden" | "md:[&>*:first-child]:flex"
    | "[&>*:last-child]:hidden" | "sm:[&>*:last-child]:block"
    | "lg:[&>*:first-child]:hidden" | "lg:[&>*:last-child]:block" | "lg:block"
    | "[&>*:nth-child(2)]:pb-16" | "md:[&>*:nth-child(2)]:pb-0"
    | "md:[&>*:nth-child(2)]:min-w-0" | "md:[&>*:nth-child(2)]:grow" | "md:hidden"
    | "[&>*]:px-4" | "[&>*]:py-3" | "[&>*]:p-2" | "[&>*]:p-3" | "[&>*]:border-separator"
    | "[&>*:nth-child(odd)]:border-r" | "[&>*:nth-child(-n+4)]:border-b"
    | "[&>*:first-child]:w-5" | "[&>*:first-child]:shrink-0"
    | "[&>*:first-child]:text-center" | "[&>*:first-child]:tabular-nums"
    | "[&>*:first-child]:pt-4" | "[&>*:last-child]:pb-4"
    | "[&>*:first-child]:bg-surface-secondary" | "[&>*:first-child]:px-4" | "[&>*:first-child]:py-2"
    | "[&>*:not(:last-child)]:border-b" | "sm:[&>*:not(:last-child)]:border-b-0" | "sm:[&>*:not(:last-child)]:border-r"
    // The unprefixed pair. `md:[&>*:first-child]:min-w-0` and its `grow` twin were already here for
    // the rail layouts, which only take the flexible-first shape above the md breakpoint; a row
    // whose FIRST child takes the slack at every width needs the same two names without the prefix.
    | "[&>*:first-child]:min-w-0" | "[&>*:first-child]:grow"
    | "[&>*:first-child]:col-span-2" | "sm:[&>*:first-child]:col-span-2" | "sm:[&>*:last-child]:col-span-2"
    | "sm:[&>*:only-child]:col-span-2" | "lg:[&>*:first-child]:col-span-4"

/** Literal values a contract may require from a child component's data props. */
export type ContractPropValue = string | number | boolean | null

/** A child appears once unless it explicitly declares a repeated run and its resting count. */
export type ContractChildCardinality =
    | { readonly repeats?: false, readonly restingCount?: never }
    | { readonly repeats: true, readonly restingCount: number }

/** One named child slot: a leaf, a fixed composite, or another closed contract identity. */
export type ContractChildSpec = ContractChildCardinality & {
    readonly leaf?: string | ReadonlyArray<string>
    readonly composite?: string | ReadonlyArray<string>
    readonly contract?: string | ReadonlyArray<string>
    readonly props?: Readonly<Record<string, ContractPropValue>>
    readonly optional?: boolean
}

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

/**
 * Elements an entry may name as its own host.
 *
 * A `<main>` is not a `<div>` with a class - it is the document's one main landmark, and a screen
 * reader offers it as a destination. The same is true of `<nav>`, `<ul>` and `<form>`: each is a
 * MEANING, and meaning belongs beside the classes and the children rather than in a second frame
 * component per element. `Main` used to be exactly that second frame; it existed only to swap the
 * tag, so every rule that knew `Tree` had to be taught it separately, and one that was not taught
 * reported the landmark as a node with no key.
 */
export type ContractHostTag = "div" | "main" | "nav" | "ul" | "ol" | "form" | "section" | "aside" | "header"

/** One registry entry: a node's own classes, and why what it holds sits that way. */
export interface ContractSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: ReadonlyArray<LayoutClassName>
    /** The element this node opens. Absent means `div` - a node with no meaning of its own. */
    readonly host?: ContractHostTag
    /** Named child grammar. No anonymous `children` hole exists in a contract. */
    readonly children: Readonly<Record<string, ContractChildSpec>>
    /**
     * Why the children of this node sit the way they do, in one sentence.
     *
     * A REASON, never a restatement of the key: "a row of chips" only says the key again; "the
     * tags wrap onto their own line before the title does" is the fact that made the node exist.
     */
    readonly why: string
}

/**
 * Build the registry.
 *
 * A function rather than a bare literal so the keys are checked in one place and stay literal
 * without an `as const` at the call site.
 */
const buildContracts = <const T extends { readonly [K in keyof T]: ContractSpec }>(contracts: T): T =>
    contracts

/**
 * The registry. Every node the design layer may draw, and the reason each one holds its children
 * the way it does.
 *
 * KEEP THE NAMES CHILD-FIXING. A key whose name does not say what belongs inside it stops
 * constraining anything, and its `why` decays into a label the moment a second screen uses it.
 */
export const CONTRACTS = buildContracts({
    /*
     * ── THE CONSOLE FRAME ────────────────────────────────────────────────────────────────────────
     *
     * Four entries admitted together because they are one topology: a section list beside a routed
     * body, the landmark that body opens, and the measure a section reads at. Splitting them would
     * put a frame in the table that nothing can legally sit inside.
     */
    "centred-authentication-page": {
        // The document's one main landmark. An authentication route's whole content is this surface,
        // so while it rendered as a plain div a screen reader had nothing to skip to - which was true
        // of the shipped sign-in screen for as long as it existed.
        host: "main",
        // THE MEASURE IS WRITTEN ON THE CHILD FROM HERE, and that is not a shortcut. The surface
        // below is drawn by `SurfaceFormCard`, which renders a vendor `Card` and puts the entry's own
        // node INSIDE it - so `authentication-panel-card`'s `max-w-sm` constrains the card's contents
        // and never the card. Left alone, the card is a flex item with no width and shrinks to fit
        // its longest line: 263px instead of 384px, and narrower still in a language with shorter
        // words. The measure has to reach the element the reader sees a border around.
        classes: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6", "[&>*]:w-full", "[&>*]:max-w-sm"],
        children: {
            surface: { contract: "authentication-panel-card" },
        },
        why: "when authentication is the route's only task and its one bounded form must sit at the visual centre rather than inherit the dashboard's rail-and-main reading order.",
    },
    "centred-viewport-main": {
        // The document's one main landmark. The key's name has said so all along; now the entry
        // does, instead of a second frame component existing to swap the tag.
        host: "main",
        classes: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6"],
        children: {
            content: { contract: "centred-title-pair" },
        },
        why: "if you need a route whose entire content is one short centred pair, held at the viewport's optical middle rather than pinned to the top of the page.",
    },
    "authentication-panel-card": {
        classes: ["w-full", "max-w-sm", "p-4"],
        children: {
            panel: { contract: "centred-page-column" },
        },
        why: "if you need the one bounded card holding the sign-in/sign-up form, sized on the card element itself rather than borrowed from a vendor ground that has no opinion of its own",
    },
    "academy-band-run": {
        // The academy's routed body is the main landmark. Its class list stays empty because the
        // bands inside own their own rhythm; the element is the meaning, not the spacing.
        host: "main",
        classes: [],
        children: { content: { contract: "academy-band-list" } },
        why: "if you need the landmark that stacks an academy landing page's bands without adding any seam, gap or padding of its own, because each band already owns its own full-bleed inset and closing rule",
    },
    "academy-band-list": {
        classes: [],
        children: { band: { composite: "academy-band", repeats: true, restingCount: 0 } },
        why: "if the AcademySections block needs one typed non-landmark owner for its ordered business bands.",
    },
    "banded-measure-column": {
        classes: ["w-full", "border-b", "border-separator", "px-6", "py-6"],
        children: {
            column: { contract: "stacked-band-parts" },
        },
        why: "if you need a full-width closing rule under one landing-page section on the plain page ground, with the section's own reading column nested inside it.",
    },
    "banded-measure-column-on-surface": {
        classes: ["w-full", "border-b", "border-separator", "px-6", "py-6", "bg-surface"],
        children: {
            column: { contract: "stacked-band-parts" },
        },
        why: "if you need the same full-width section-closing rule as its plain-ground sibling, but on an alternating surface ground so a reader can count sections without reading them.",
    },
    "stacked-band-parts": {
        classes: ["mx-auto", "flex", "w-full", "max-w-3xl", "flex-col", "gap-6"],
        children: {
            part: {
                contract: [
                    "title-with-end-action",
                    "claim-panel-grid",
                    "captioned-cell-grid",
                    "figure-beside-prose",
                    "numbered-step-stack",
                    "question-answer-list",
                    "inline-action-run",
                    "heading-body-action-stack",
                    "centred-heading-body-action",
                    "centred-empty-notice",
                    "form-column",
                ],
                leaf: ["heading", "text", "pull-quote", "image-frame"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "if you need the capped-width column a landing-page band uses to stack its own content parts top to bottom at one seam.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            title: { leaf: "heading" },
            end: { leaf: ["button", "see-more-link"], optional: true },
        },
        why: "if you need a section title with one optional trailing button or see-more link at the far end of its line, dropping under the title when the line runs out.",
    },
    "title-over-description": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if one page header needs its explanatory sentence directly under the page title as one compact identity block rather than as a separate page section.",
    },
    "display-title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-6"],
        children: {
            title: { leaf: "heading", props: { scale: "display" } },
            end: { leaf: "button", props: { size: "lg" }, optional: true },
        },
        why: "if you need the accepted console page root to pair one display-scale title with its optional large primary action, without promoting section headings or ordinary controls.",
    },
    "agentos-page-heading": {
        classes: ["flex", "min-w-0", "flex-row", "flex-wrap", "items-start", "justify-between", "gap-6"],
        children: {
            identity: { contract: "agentos-page-identity" },
            action: { leaf: "button", props: { size: "lg" }, optional: true },
        },
        why: "if an AgentOS route needs one persistent tile mark, page identity and optional primary continuation to remain a single header across dashboard and narrow compositions.",
    },
    "agentos-page-identity": {
        classes: ["flex", "min-w-0", "flex-row", "items-start", "gap-4"],
        children: {
            mark: { leaf: "tile-icon" },
            copy: { contract: "agentos-page-title-stack" },
        },
        why: "if the AgentOS product mark must lead the route title and explanation without becoming a decorative card or detaching on narrow screens.",
    },
    "agentos-page-title-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            eyebrow: { leaf: "text", props: { size: "sm", tone: "accent" } },
            title: { leaf: "heading", props: { scale: "display" } },
            description: { leaf: "text", props: { size: "md", tone: "muted" } },
            status: { leaf: "badge", optional: true },
        },
        why: "if one AgentOS route identity needs its product context, display title, explanatory consequence and optional lifecycle status in one ordered copy column.",
    },
    "agentos-summary-heading": {
        classes: ["flex", "flex-row", "items-center", "gap-3"],
        children: {
            mark: { leaf: "tile-icon" },
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
        },
        why: "if one AgentOS account summary needs a semantic tile mark and compact label before its measured value.",
    },
    "agentos-summary-card": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            heading: { contract: "agentos-summary-heading" },
            value: { leaf: "text", props: { size: "metric-lead" } },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if one dashboard signal needs its identity, measured total and current consequence to compare with two peer signals.",
    },
    "agentos-summary-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "lg:grid-cols-3"],
        children: {
            signal: { contract: "agentos-summary-card", repeats: true, restingCount: 3 },
        },
        why: "if the three AgentOS account signals must compare in one row when wide and preserve their reading order as full cards when narrow.",
    },
    "agentos-dashboard-body": {
        classes: ["flex", "w-full", "flex-col", "gap-8"],
        children: {
            summary: { contract: "agentos-summary-grid" },
            collection: { contract: "label-row-over-card" },
        },
        why: "if the AgentOS dashboard must keep account-level signals before the owned workspace collection without merging either state owner into the other.",
    },
    "agentos-state-notice": {
        classes: ["flex", "min-w-0", "flex-row", "items-start", "gap-4", "p-6"],
        children: {
            mark: { leaf: "tile-icon" },
            copy: { contract: "heading-body-action-stack" },
        },
        why: "if loading or refusing one exact AgentOS workspace needs a strong state mark beside its consequence and optional recovery without pretending the workspace is empty.",
    },
    "agentos-route-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-8", "px-6", "py-8"],
        children: {
            path: { leaf: "breadcrumbs", optional: true },
            heading: { contract: ["title-with-end-action", "agentos-page-heading"] },
            sectionHeading: { leaf: "heading", optional: true },
            section: { contract: ["label-row-over-card", "agentos-dashboard-body"], repeats: true, restingCount: 2 },
        },
        why: "if dashboard, pre-persistence creation and persisted AgentOS orders must share one mature page measure inside the console's existing main landmark while keeping their route-owned sections separate.",
    },
    "inline-action-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "if you need a row of presses in priority order that wraps instead of stretching a lone button to the full width of its column",
    },
    "title-with-baseline-fact": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need a heading with one small muted fact riding its baseline as part of the same sentence, instead of squeezing the title narrow.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            /*
             * ONE TITLE OWNER. A body such as `module-intake-form` or
             * `module-specification-review` already carries the heading that explains its work.
             * Requiring another label here makes both layers repeat the same sentence. Keep the
             * outer label for anonymous lists and cards; omit it when the body names itself.
             */
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"], optional: true },
            /*
             * `$content` USED TO SIT HERE, AND NOTHING COULD EVER FILL IT. It is not a ContractKey, so
             * `ContractChild` resolved it to `never` and every attempt to render this node with a
             * body was a type error. The key survived because it is only ever referenced AS a child
             * by `stacked-sections`, `dashboard-main` and `dashboard-rail` - nobody had rendered one
             * directly yet, so the placeholder never had to answer for itself.
             *
             * Replaced with the bodies a section actually holds. A leaf is admitted beside them
             * because an empty or failed section says its one sentence in the same column its rows
             * would have used.
             */
            body: {
                contract: [
                    "labelled-fact-stack", "inline-action-run", "fleet-resource-list",
                    "stacked-stat-rows", "claim-panel-grid", "captioned-cell-grid", "progress-row-stack", "centred-empty-notice",
                    // A named section drawn around one attributed claim. It was already drawn that
                    // way at a real call site and this list did not say so, which is how the branch
                    // ended up wearing the section on a box of its own rather than rendering it.
                    "attributed-claim-panel",
                    // A refusal is a THIRD answer beside a body and an emptiness. A section that
                    // cannot draw one has to fall back on the empty notice, which tells the reader
                    // nothing was there when the server in fact declined to say.
                    "body-with-refusal-note", "heading-body-action-stack", "form-column", "identity-action-list",
                    "account-signal-card", "attention-grouped-fleet-list",
                    "status-action-card", "status-action-card-grid", "workspace-runtime-stack", "helm-component-status-table",
                    "agentos-summary-card", "agentos-summary-grid", "agentos-state-notice",
                    "infrastructure-summary", "wallet-summary", "module-summary", "module-bindings",
                    "wallet-balance-surface", "wallet-top-up-form", "wallet-payment-result",
                    "responsive-four-stage-lifecycle-stepper", "identity-phase-action", "provisioning-order-content",
                    "wallet-checkout-evidence", "wallet-ledger-detail", "wallet-linked-invoice",
                    "custom-module-collection", "module-intake-form", "adaptive-intake-explanation",
                    "adaptive-module-interview", "live-module-profile", "module-attachment-list",
                    "module-integration-list", "module-specification-review",
                    "responsive-agentos-readiness-stepper", "workspace-ai-readiness-summary",
                    "knowledge-origin-list", "readiness-component-list", "module-document-ingestion-list",
                    "workspace-ai-knowledge-stack", "agentos-chat-body", "agentos-context-review",
                    "agentos-workbench-body", "agentos-settings-form", "agentos-diagnostics-body", "agentos-cockpit-rail-body",
                    "agentos-test-scenario-body", "agentos-test-evidence-body",
                ],
                leaf: "text",
            },
        },
        why: "if you need one section whose anonymous body receives a label outside the card, or whose self-naming body remains the sole title owner, so cards never nest and headings never repeat.",
    },
    "custom-module-collection": {
        classes: ["flex", "w-full", "flex-col", "divide-y", "divide-separator"],
        children: {
            module: { contract: "identity-kind-status-action-row", repeats: true, restingCount: 3 },
        },
        why: "if one workspace owner needs custom-module identities, lifecycle status and one exact continuation to remain a single joined scan rather than a grid of competing cards.",
    },
    "module-intake-form": {
        host: "form",
        classes: ["flex", "w-full", "flex-col", "gap-4", "p-6"],
        children: {
            prompt: { contract: "title-over-description" },
            goal: { composite: "field" },
            note: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "if one meaningful opening goal must remain beside its zero-write consequence and the only action that creates a persistent intake identity.",
    },
    "adaptive-intake-explanation": {
        classes: ["flex", "w-full", "flex-col", "gap-4", "p-6"],
        children: {
            title: { leaf: "heading" },
            steps: { contract: "numbered-step-stack" },
            note: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if the owner must understand adaptive follow-up, resumability and explicit review before beginning work that will persist.",
    },
    "module-interview-message": {
        classes: ["flex", "w-full", "flex-col", "gap-1", "p-4", "rounded-2xl", "border", "border-separator"],
        children: {
            actor: { leaf: "text", props: { size: "xs", tone: "muted" } },
            content: { leaf: "text", props: { size: "sm" } },
        },
        why: "if one persisted interview turn needs its speaker and accepted content kept together in chronological reading order.",
    },
    "adaptive-module-interview": {
        classes: ["flex", "w-full", "flex-col", "gap-4", "p-6"],
        children: {
            heading: { contract: "subject-over-muted-caption" },
            message: { contract: "module-interview-message", repeats: true, restingCount: 3 },
            composer: { contract: "form-column", optional: true },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if persisted turns, the backend-selected next question and its answer composer must remain the primary resumable work surface.",
    },
    "live-module-profile": {
        classes: ["flex", "w-full", "flex-col", "gap-4", "p-4"],
        children: {
            progress: { composite: "labelled-progress-row" },
            facts: { contract: "labelled-fact-stack" },
            missing: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if backend-owned completeness, accepted facts and unresolved fields must stay visible while the interview advances.",
    },
    "module-attachment-list": {
        classes: ["flex", "w-full", "flex-col", "gap-3", "p-4"],
        children: {
            attachment: { contract: "subject-over-muted-caption-with-action", repeats: true, restingCount: 2 },
            upload: { leaf: "button" },
            notice: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if quarantined evidence files must show their scan lifecycle and a safe removal or retry beside the one bounded add-file action.",
    },
    "module-document-ingestion-list": {
        classes: ["flex", "w-full", "flex-col", "gap-4", "p-4"],
        children: {
            attachment: { contract: "document-ingestion-row", repeats: true, restingCount: 2 },
            upload: { leaf: "button" },
            notice: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if uploaded module documents must expose the complete scan, extraction, embedding and private indexing lifecycle instead of collapsing progress into one raw status string.",
    },
    "document-ingestion-row": {
        classes: ["flex", "w-full", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption-with-action" },
            progress: { contract: "responsive-document-ingestion-stepper" },
            notice: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if one module document must keep its immutable file identity above a bounded connected ingestion progression and any local refusal consequence.",
    },
    "module-integration-list": {
        classes: ["flex", "w-full", "flex-col", "gap-4", "p-4"],
        children: {
            integration: { contract: "subject-over-muted-caption-with-action", repeats: true, restingCount: 1 },
            key: { composite: "field" },
            action: { leaf: "button" },
            notice: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if configured providers may return only masked status while replacement remains a separate write-only key operation.",
    },
    "module-specification-review": {
        classes: ["flex", "w-full", "flex-col", "gap-6", "p-6"],
        children: {
            heading: { contract: "title-with-baseline-fact" },
            summary: { contract: "labelled-fact-stack" },
            acknowledgement: { leaf: "checkbox" },
            action: { leaf: "button" },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if one immutable specification version must be read, explicitly acknowledged and only then submitted for installation.",
    },
    "agentos-module-shell-page": {
        host: "div",
        classes: ["mx-auto", "flex", "w-full", "max-w-screen-2xl", "flex-col", "gap-4", "px-4", "py-6", "md:px-6"],
        children: {
            path: { leaf: "breadcrumbs" },
            heading: { contract: "agentos-page-heading" },
            navigation: { leaf: "choice-tabs" },
            body: { contract: ["agentos-setup-layout", "agentos-test-layout", "agentos-operate-layout", "agentos-settings-layout", "agentos-diagnostics-layout"] },
        },
        why: "if one installed AgentOS module must retain its path, identity, lifecycle and local navigation while Setup, Test, Operate, Settings and Diagnostics replace only the task body.",
    },
    "agentos-setup-layout": {
        classes: ["grid", "grid-cols-1", "items-start", "gap-4", "lg:grid-cols-[14rem_minmax(0,6fr)_minmax(20rem,4fr)]", "lg:[&>*:first-child]:hidden"],
        children: {
            mode: { contract: "agentos-cockpit-mode-compact" },
            versions: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            conversation: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            context: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
        },
        why: "if immutable Setup revisions, the private follow-up conversation and business-understanding evidence must form one desktop cockpit while one explicit pane remains visible on compact screens.",
    },
    "agentos-test-layout": {
        classes: ["grid", "grid-cols-1", "items-start", "gap-4", "lg:grid-cols-[14rem_minmax(0,6fr)_minmax(20rem,4fr)]", "lg:[&>*:first-child]:hidden"],
        children: {
            mode: { contract: "agentos-cockpit-mode-compact" },
            scenarios: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            conversation: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            evidence: { contract: ["agentos-cockpit-sidecar-pane", "agentos-cockpit-sidecar-pane-wide-only"] },
        },
        why: "if a side-effect-free kind scenario suite, its test conversation and persisted trust evidence must remain visible together on desktop and explicitly switch on compact screens.",
    },
    "agentos-cockpit-pane": {
        classes: ["min-w-0"],
        children: { body: { contract: "label-row-over-card" } },
        why: "if the selected compact cockpit pane must remain visible and retain its ordinary desktop column.",
    },
    "agentos-cockpit-mode-compact": {
        classes: ["min-w-0"],
        children: { navigation: { leaf: "choice-tabs" } },
        why: "if compact cockpit navigation must switch one visible pane below the desktop breakpoint without consuming a column in the approved three-pane desktop composition.",
    },
    "agentos-cockpit-pane-wide-only": {
        classes: ["hidden", "min-w-0", "lg:block"],
        children: { body: { contract: "label-row-over-card" } },
        why: "if an unselected compact cockpit pane must stand down below desktop without leaving the approved three-pane composition.",
    },
    "agentos-cockpit-sidecar-pane": {
        classes: ["min-w-0", "lg:sticky", "lg:top-6"],
        children: { body: { contract: "label-row-over-card" } },
        why: "if selected evidence must remain readable on compact screens and stay visible beside a longer desktop task.",
    },
    "agentos-cockpit-sidecar-pane-wide-only": {
        classes: ["hidden", "min-w-0", "lg:block", "lg:sticky", "lg:top-6"],
        children: { body: { contract: "label-row-over-card" } },
        why: "if unselected compact evidence must stand down while preserving its sticky desktop sidecar position.",
    },
    "agentos-cockpit-rail-body": {
        classes: ["flex", "min-h-0", "flex-col", "gap-3", "p-2"],
        children: {
            summary: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            items: { leaf: "selection-list" },
            action: { leaf: "button", optional: true },
        },
        why: "if context versions, test scenarios or diagnostic signals need one typed data-only rail without a ReactNode content opening.",
    },
    "agentos-test-scenario-body": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            scenario: { leaf: "choice-tabs", optional: true },
            context: { contract: "labelled-fact-stack" },
            field: { contract: "label-field-hint", repeats: true, restingCount: 1, optional: true },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "if one registered kind test needs editable fake inputs, an explicit immutable context identity and one isolated run command without exposing live integrations.",
    },
    "agentos-test-evidence-body": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            identity: { contract: "title-with-baseline-fact" },
            summary: { contract: "labelled-fact-stack" },
            assertion: { contract: "labelled-fact-stack", repeats: true, restingCount: 1, optional: true },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if persisted pass, warning and fail assertions must explain exactly what was expected and observed before a business owner trusts or applies the tested context.",
    },
    "agentos-operate-layout": {
        classes: ["grid", "grid-cols-1", "items-start", "gap-4", "lg:grid-cols-[14rem_minmax(0,6fr)_minmax(20rem,4fr)]", "lg:[&>*:first-child]:hidden"],
        children: {
            mode: { contract: "agentos-cockpit-mode-compact" },
            sessions: { contract: "agentos-session-rail-responsive" },
            chat: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            workbench: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
        },
        why: "if collaborative Execute sessions, persistent Chat and the kind workbench must read as three peers when wide while one explicit Chat/Workbench choice controls the compact presentation.",
    },
    "agentos-session-rail-responsive": {
        classes: ["min-w-0", "[&>*:last-child]:hidden", "lg:[&>*:first-child]:hidden", "lg:[&>*:last-child]:block"],
        children: {
            compact: { contract: "agentos-session-rail-compact" },
            expanded: { leaf: "collapsible-rail" },
        },
        why: "if one Execute session selection must transform from a compact keyboard choice into the persistent collapsible rail without losing its selected identity.",
    },
    "agentos-session-rail-compact": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            sessions: { leaf: ["choice-tabs", "selection-list"] },
            create: { leaf: "button" },
        },
        why: "if compact Execute navigation needs one horizontally scrollable peer choice followed by the bounded create-session action.",
    },
    "agentos-chat-body": {
        classes: ["flex", "min-h-0", "flex-col", "gap-4", "p-4"],
        children: {
            session: { leaf: "choice-tabs", optional: true },
            message: { contract: ["module-interview-message", "agentos-execute-message"], repeats: true, restingCount: 3 },
            composer: { contract: "form-column", optional: true },
            action: { leaf: "button", optional: true },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if one persistent Module Studio conversation must keep its accepted messages before one bounded composer and an optional refusal consequence.",
    },
    "agentos-execute-message": {
        classes: ["flex", "w-full", "flex-col", "gap-2", "rounded-2xl", "border", "border-separator", "p-4"],
        children: {
            actor: { leaf: "text", props: { size: "xs", tone: "muted" } },
            content: { contract: "agentos-markdown-content" },
            context: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            widget: { contract: "agentos-widget-panel", optional: true },
        },
        why: "if one immutable Execute message must keep its actor, accepted content, bound context identity and optional trusted widget together without admitting arbitrary markup.",
    },
    "agentos-markdown-content": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            block: { leaf: ["heading", "text"], repeats: true, restingCount: 1 },
        },
        why: "if sanitized MessageTree Markdown must vary between headings, paragraphs and list lines without admitting HTML or a ReactNode escape slot.",
    },
    "agentos-widget-panel": {
        classes: ["flex", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            facts: { contract: "labelled-fact-stack", optional: true },
            action: { contract: "inline-action-run", optional: true },
            refusal: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if a registry-validated widget must expose its exact component identity, typed values and admitted actions while an unknown schema fails closed in the same bounded shape.",
    },
    "agentos-context-review": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            heading: { contract: "title-with-baseline-fact" },
            summary: { leaf: "text", props: { size: "sm" } },
            facts: { contract: "labelled-fact-stack" },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button", repeats: true, restingCount: 1 },
        },
        why: "if one immutable context candidate must name its version, summarize its snapshot and require an explicit Apply action while the prior version remains active.",
    },
    "agentos-workbench-body": {
        classes: ["flex", "min-h-0", "flex-col", "gap-4", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            facts: { contract: "labelled-fact-stack" },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if one open registry workbench must explain its versioned identity and current kind-owned facts without changing the shared Module Studio shell.",
    },
    "agentos-settings-layout": {
        classes: ["grid", "grid-cols-1", "gap-4", "lg:grid-cols-[minmax(0,1fr)_20rem]"],
        children: {
            settings: { contract: "label-row-over-card" },
            context: { contract: "label-row-over-card" },
        },
        why: "if owner settings remain the primary operation while active context history is progressively disclosed as a narrower consequence rail.",
    },
    "agentos-settings-form": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            field: { contract: "label-field-hint", repeats: true, restingCount: 1 },
            mode: { leaf: "choice-tabs", optional: true },
            confirmation: { leaf: "checkbox", optional: true },
            action: { leaf: "button", repeats: true, restingCount: 1 },
            credentialField: { contract: "label-field-hint", repeats: true, restingCount: 0, optional: true },
            credentialStatus: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            credentialAction: { leaf: "button", repeats: true, restingCount: 0, optional: true },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if one module's owner-editable display and confirmation settings must remain separate from backend-owned kind and permission facts.",
    },
    "agentos-diagnostics-layout": {
        classes: ["grid", "grid-cols-1", "items-start", "gap-4", "lg:grid-cols-[14rem_minmax(0,6fr)_minmax(20rem,4fr)]", "lg:[&>*:first-child]:hidden"],
        children: {
            mode: { contract: "agentos-cockpit-mode-compact" },
            signals: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            readiness: { contract: ["agentos-cockpit-pane", "agentos-cockpit-pane-wide-only"] },
            evidence: { contract: ["agentos-cockpit-sidecar-pane", "agentos-cockpit-sidecar-pane-wide-only"] },
        },
        why: "if diagnostics are requested explicitly and must keep signal navigation, operating health and redacted event evidence together on desktop without exposing credentials.",
    },
    "agentos-diagnostics-body": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            facts: { contract: "labelled-fact-stack" },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if progressive diagnostics must compare already-safe runtime facts and one bounded consequence without leaking configuration or credentials.",
    },
    "highlight-card-shell": {
        classes: ["relative"],
        children: {
            sweep: { leaf: "accent-sweep", optional: true },
            surface: { leaf: "highlight-card-surface" },
        },
        why: "if one typed surface needs a transient perimeter accent behind it without giving the caller an untyped content opening.",
    },
    "empty-notice-stack": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "text-center"],
        children: {
            mark: { leaf: "icon-tile", optional: true },
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a centred empty-state notice with an optional generic mark, a settled message and an optional recovery action",
    },
    "rank-title-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            rank: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            title: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "if you need a discovery result row pairing a compact fixed-width rank with one actionable title that takes the remaining width",
    },
    "step-number-then-instruction": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            ordinal: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            instruction: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need one row of a numbered sequence — a fixed tabular ordinal beside an instruction that takes the remaining width",
    },
    "numbered-step-stack": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            step: { contract: "step-number-then-instruction", repeats: true, restingCount: 4 },
        },
        why: "if you need an ordered roadmap read top to bottom, where the number is part of the meaning rather than a decorative list marker",
    },
    "avatar-identity-badge-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "name-over-handle" },
            badge: { leaf: "badge", optional: true },
            action: { leaf: "button" },
        },
        why: "if you need a suggested-identity row — avatar, name stack owning the flexible middle, an optional qualifying badge, and a trailing follow action.",
    },
    "avatar-identity-rating-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "subject-over-muted-caption" },
            rating: { leaf: "rating", optional: true },
        },
        why: "if you need a testimonial row — avatar, name stack owning the flexible middle, and an optional trailing rating.",
    },
    "identity-kind-status-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            identity: { contract: "name-over-handle" },
            kind: { leaf: "badge", props: { tone: "neutral" } },
            status: { leaf: "badge" },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a fleet row that answers what a resource is with a fixed neutral badge before what state it is in with a separate changing badge, plus an optional action.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text-link", props: { size: "sm" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a two-line identity stack whose name is itself a link — a lead, template or workspace row — rather than the current user's own profile display",
    },
    "subject-over-muted-caption": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            subject: { leaf: ["heading", "text", "image-frame"] },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a subject — a person, a figure, or a photograph — paired directly with a small muted caption explaining it beneath.",
    },
    "activity-actor-body-time-row": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            body: { contract: "activity-sentence-over-reaction" },
            time: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one activity row with the actor's avatar, the event body in the flexible middle, and a quiet trailing timestamp.",
    },
    "activity-sentence-over-reaction": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            sentence: { contract: "activity-actor-action-target-sentence" },
            reaction: { leaf: "reaction-picker", optional: true },
        },
        why: "if you need an optional reaction control placed directly beneath the complete activity sentence it responds to, rather than beside one fragment of it.",
    },
    "activity-actor-action-target-sentence": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            actor: { leaf: "text-link", props: { size: "sm" } },
            action: { leaf: "text", props: { size: "sm" } },
            target: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "if you need actor, action and an optional target to read and wrap together as one sentence with two actionable names.",
    },
    "contribution-calendar-stack": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            heading: { contract: "contribution-calendar-heading-row" },
            grid: { leaf: "contribution-grid" },
            footer: { contract: "contribution-calendar-footer-row" },
        },
        why: "if you need a fixed contribution-calendar composite — heading, plot and footer — closed as one region without owning the plot's own DOM mechanics.",
    },
    "contribution-calendar-heading-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            total: { leaf: "text", props: { size: "xs", tone: "muted" } },
            years: { leaf: "choice-tabs" },
        },
        why: "if you need a contribution calendar's activity total paired with its peer year-choice tabs on one header row.",
    },
    "contribution-calendar-footer-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            streak: { leaf: "text", props: { size: "sm" } },
            intensity: { leaf: "contribution-intensity-legend" },
        },
        why: "if you need a contribution calendar's streak result paired with its intensity legend on one footer row.",
    },
    "fleet-resource-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            /*
             * THE SLOT ADMITS A SECOND ROW IDENTITY, and that is what lets a catalogue of things on
             * offer and a list of things already owned be the SAME surface rather than two shelves.
             *
             * KNOWN TIER MISMATCH, recorded rather than hidden: both named rows are BLOCKS (they
             * read nivo's provisioning and catalogue states), but a child slot may only name a leaf,
             * a composite or a contract. Declaring them `composite` is what makes the slot
             * expressible today; the tier that is true lives on each component's own `meta.shape`.
             * Whether this spec needs a fourth kind is a canon decision, not one to settle by
             * relabelling the components.
             */
            resource: { composite: ["fleet-row", "template-offer-row"], repeats: true, restingCount: 3 },
        },
        why: "if you need one joined surface comparing rows of resources at a glance, mixing something already provisioned with something still on offer in the same scan",
    },
    "attention-grouped-fleet-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator"],
        children: {
            group: { contract: "attention-fleet-group", repeats: true, restingCount: 2 },
        },
        why: "if you need one joined fleet surface partitioned by attention so urgent resources scan first without turning either partition into a separate card or displaying a synthetic total.",
    },
    "attention-fleet-group": {
        classes: [
            "flex", "flex-col",
            "[&>*:first-child]:bg-surface-secondary", "[&>*:first-child]:px-4", "[&>*:first-child]:py-2",
        ],
        children: {
            marker: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resources: { contract: "fleet-resource-list" },
        },
        why: "if you need one plain-text partition marker immediately above comparable fleet rows, with row rhythm still owned by the joined list and no status chip promoted from the marker.",
    },
    "dual-tabs-toolbar": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            leading: { leaf: "choice-tabs" },
            trailing: { leaf: "choice-tabs" },
        },
        why: "if you need two independent primary-tab axes governing one result set, sharing a toolbar row but each keeping its own selection and accessible label",
    },
    "changelog-entry-row": {
        classes: ["flex", "w-full", "flex-col", "gap-3"],
        children: {
            meta: { contract: "date-category-row" },
            title: { leaf: ["text", "text-link"], props: { size: "sm" } },
            body: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need one closed dated changelog entry — date and category qualifying a title, with an optional muted body explaining the update beneath it",
    },
    "date-category-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            date: { leaf: "text", props: { size: "xs", tone: "muted" } },
            category: { leaf: "badge", optional: true },
        },
        why: "if you need a compact line pairing an update's date with an optional category, read before the title that follows",
    },
    "question-answer-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            entry: { contract: "question-over-answer", repeats: true, restingCount: 4 },
        },
        why: "if you need a joined list of question-and-answer entries separated by a full-width rule that the list itself owns rather than each entry remembering.",
    },
    "question-over-answer": {
        classes: ["flex", "w-full", "flex-col", "gap-2"],
        children: {
            question: { leaf: "text", props: { size: "sm", weight: "medium" } },
            answer: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need one question held tightly above the answer that settles it, at a joined-list row's tighter seam.",
    },
    "streak-week-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            day: { leaf: "day-cell", repeats: true, restingCount: 7 },
        },
        why: "if you need one fixed seven-day streak drawn as a single compact sequence of day cells",
    },
    "progress-row-stack": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            row: { composite: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a column of progress rows whose labels and figures are meant to be compared, without each row reading as its own section",
    },
    "glyph-title-fact-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "md", tone: "default" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a stat row identified by a leading glyph, with a clipping title in the middle and a quiet trailing fact",
    },
    "task-mark-title-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon" },
            title: { leaf: "text" },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a task row where a completion mark leads, the title owns the middle, and a quiet supporting fact stays aligned at the far edge",
    },
    "label-fact-over-progress": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            line: { contract: "label-with-muted-fact-row" },
            progress: { leaf: "progress" },
        },
        why: "if you need a label-and-figure line paired directly above the progress bar it explains.",
    },
    "labelled-fact-stack": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            fact: { contract: "label-value-row", repeats: true, restingCount: 4 },
        },
        why: "if you need a tight column of label-and-figure lines read as facts about one thing, closer together than the section gap would allow",
    },
    "wallet-balance-surface": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            facts: { contract: "labelled-fact-stack" },
            shortcuts: { contract: "inline-action-run", optional: true },
        },
        why: "if you need the wallet's balance facts and its payment-management ways out to share one correctly inset surface without turning each action into another card",
    },
    "wallet-top-up-form": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            field: { composite: "field" },
            note: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button" },
            refusal: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need one wallet top-up amount, its provider-settlement explanation and the single checkout action inside the controlled modal",
    },
    "wallet-checkout-evidence": {
        classes: ["flex", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            reference: { leaf: "text", props: { size: "sm" } },
            amount: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            note: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need the exact provider reference and charged amount shown as checkout evidence before handing navigation to the gateway",
    },
    "wallet-payment-result": {
        classes: ["flex", "flex-col", "items-start", "gap-4", "p-4"],
        children: {
            state: { leaf: "badge" },
            amount: { leaf: "heading" },
            reference: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            note: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "if you need a wallet return screen to distinguish confirmed, cancelled and still-unresolved settlement without claiming a provider state the API did not return",
    },
    "wallet-ledger-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            row: { contract: "wallet-ledger-row", repeats: true, restingCount: 3 },
        },
        why: "if you need wallet movements or invoices compared as one joined ledger whose shared surface, not each row, owns the separators",
    },
    "wallet-ledger-row": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            state: { leaf: "badge" },
            amount: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            action: { leaf: "button", optional: true },
        },
        why: "if you need one ledger row to keep its identity and date together while status, amount and an optional detail action remain comparable at the trailing edge",
    },
    "wallet-ledger-detail": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            facts: { contract: "labelled-fact-stack" },
            note: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need one selected wallet movement or invoice expanded into exact facts in the right-edge drawer without duplicating its summary surface",
    },
    "wallet-linked-invoice": {
        classes: ["flex", "min-w-0", "flex-col", "items-start", "gap-4", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            state: { leaf: "badge" },
            amount: { leaf: "heading" },
            order: { leaf: "text", props: { size: "xs", tone: "muted" } },
            consequence: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button", optional: true },
        },
        why: "if you need the exact invoice correlated to one AgentOS order to keep identity, settlement state, amount, order context and its one safe outcome together.",
    },
    "label-value-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need one label and one figure at opposite ends of a baseline-aligned line, repeatable into a fact sheet.",
    },
    "label-with-muted-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a joined-list row's own label rendered semibold with a smaller muted fact trailing it on one baseline, with no leading glyph.",
    },
    "claim-panel-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: {
            claim: { contract: "attributed-claim-panel", repeats: true, restingCount: 4 },
        },
        why: "if you need short independent claims compared rather than read in sequence — one per line on a narrow width, side by side once there is room",
    },
    "attributed-claim-panel": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            voice: { contract: "avatar-identity-rating-row", optional: true },
            claim: { leaf: "text" },
            note: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            proof: { leaf: "badge", optional: true },
        },
        why: "if you need one claim on its own surface, optionally attributed to a named speaker above it and backed by a proof chip below",
    },
    "captioned-cell-grid": {
        classes: ["grid", "grid-cols-2", "gap-6", "lg:grid-cols-3"],
        children: {
            cell: { contract: "subject-over-muted-caption", repeats: true, restingCount: 4 },
        },
        why: "if you need figures or photographs scanned across in two columns even on a phone, rather than one alone reading as a headline",
    },
    "figure-beside-prose": {
        classes: ["grid", "grid-cols-1", "gap-6", "sm:grid-cols-2"],
        children: {
            figure: { leaf: "image-frame" },
            prose: { contract: ["instructor-credibility-column", "heading-body-action-stack"] },
        },
        why: "if you need a picture and the prose that earns trust from it read as one statement — side by side once there is width, stacked on a phone",
    },
    "instructor-credibility-column": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            bio: { leaf: "text", props: { tone: "muted" } },
            credentials: { contract: "credential-line-stack" },
            quote: { leaf: "pull-quote", optional: true },
        },
        why: "if you need a fixed credibility order for one instructor — who this is, what they have done, what they say — rather than a free-form stack",
    },
    "credential-line-stack": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            credential: { leaf: "text", props: { size: "sm" }, repeats: true, restingCount: 3 },
        },
        why: "if you need an unordered list of credentials a reader skims for the one they recognise, sitting tighter than any other stack on the page",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { leaf: "label" },
            field: { leaf: ["input", "field"] },
            hint: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need one form control — a label, its field, and an optional hint that sits under the field rather than beside the label.",
    },
    "form-column": {
        classes: ["flex", "w-full", "max-w-sm", "flex-col", "gap-4"],
        children: {
            field: { contract: "label-field-hint", repeats: true, restingCount: 3 },
            submit: { leaf: "button" },
        },
        why: "if you need a narrow single-column form read one control at a time, with a wider seam between controls than inside any of them",
    },
    "centred-page-column": {
        classes: ["mx-auto", "flex", "w-full", "max-w-sm", "flex-col", "gap-6"],
        children: {
            header: { contract: "centred-title-pair" },
            body: {
                contract: ["auth-entry-stack", "stacked-peer-controls", "centred-title-pair", "spread-choice-row"],
                leaf: ["form", "divider"],
                repeats: true,
                restingCount: 0,
            },
            footer: { contract: ["spread-choice-row", "centred-prompt-row"], optional: true },
        },
        why: "if you need a narrow centred column that stacks a title pair, a repeating body of peer controls or forms, and an optional closing prompt row.",
    },
    "auth-entry-stack": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcuts: { contract: "auth-shortcuts-over-divider" },
            credentials: { leaf: "form" },
        },
        why: "if you need authentication's two entry blocks — OAuth shortcuts closed by an OR divider, then the credential form — held together as one seam.",
    },
    "centred-title-pair": {
        classes: ["flex", "flex-col", "gap-3", "items-center", "text-center"],
        children: {
            mark: { leaf: ["icon", "brand-mark"], optional: true },
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need an optional icon, a title and a supporting description centred together to read as a surface's own name rather than its first content row.",
    },
    "centred-heading-body-action": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "text-center"],
        children: {
            heading: { leaf: "heading", optional: true },
            body: { leaf: "text", optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a closing call centred as three independently optional parts — heading, body and action — treated as the whole subject of a section.",
    },
    "heading-body-action-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            heading: { leaf: "heading", optional: true },
            body: { leaf: "text", optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "if you need the same heading/body/action close read left-aligned in a narrow or beside-a-picture column, rather than centred",
    },
    "auth-shortcuts-over-divider": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            // ONE, because one provider ships. The resting count is what the skeleton draws before
            // anything is known, so leaving it at two would promise a second shortcut that never
            // arrives - a loading state that lies about the screen it is standing in for.
            shortcut: { leaf: "button", repeats: true, restingCount: 1 },
            divider: { leaf: "divider" },
        },
        why: "if you need OAuth shortcut buttons and the OR divider that closes them, kept as one alternative-entry cluster before the credential form begins.",
    },
    "stacked-peer-controls": {
        classes: ["flex", "flex-col", "gap-4", "[&>*]:w-full"],
        children: {
            control: {
                contract: "spread-choice-row",
                leaf: ["button", "quick-action-row", "quick-actions-list", "text"],
                composite: ["field", "labelled-progress-row", "stat-row"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "if you need a column of independently readable peer controls — fields, actions, or stat rows — spaced so the run still reads as one form.",
    },
    "stacked-stat-rows": {
        classes: ["flex", "flex-col", "p-0", "[&>*]:w-full", "[&>*]:p-2"],
        children: {
            stat: { composite: "stat-row", repeats: true, restingCount: 3 },
        },
        why: "if you need standing figures listed with no parent inset or gap, each row sharing a select-like row geometry for its icon, label and value.",
    },
    "profile-avatar-name-handle-disclosure-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-2", "py-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "profile-name-over-handle" },
            disclosure: { leaf: "icon" },
        },
        why: "if you need one pressable row identifying the signed-in profile — avatar, name-over-handle, and a trailing disclosure glyph that marks the whole row as a link elsewhere",
    },
    "profile-name-over-handle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a plain, non-link name-over-handle stack for the profile row itself, where the whole row is the pressable target rather than the name",
    },
    "spread-choice-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            choice: { leaf: ["checkbox", "text-link"] },
            exit: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "if you need a choice and its way out pushed to opposite ends of one line — two peers a reader picks between, not a label and the thing it names",
    },
    "centred-prompt-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "if you need a short question and its single link answer read as one centred sentence on one line.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "p-4", "text-center"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "if you need an empty-state notice with its recovery action bundled in, centred within a band or section.",
    },

    /*
     * ── THE CONSOLE RAIL AND ITS ROUTED BODY ─────────────────────────────────────────────────────
     *
     * Four entries belong to one topology: one responsive global navbar, the standing destination
     * rail, the routed body and the landmark that body opens.
     */
    "console-topbar-over-sidebar-body": {
        classes: ["flex", "min-h-screen", "w-full", "flex-col"],
        children: {
            topbar: { contract: "console-global-navbar" },
            content: { contract: "sidebar-then-body-app" },
        },
        why: "if you need authenticated console chrome to keep one capability-backed global navbar above the standing navigation and routed body across every viewport",
    },
    "console-global-navbar": {
        host: "header",
        classes: [
            "sticky", "top-0", "z-40", "flex", "h-16", "w-full", "items-center",
            "justify-between", "gap-3", "border-b", "border-separator", "bg-surface", "px-3",
        ],
        children: {
            identity: { contract: "console-navbar-identity" },
            tools: { contract: "console-navbar-tools" },
        },
        why: "if you need authenticated console routes to preserve product identity and expose only real global capabilities in one persistent landmark on wide and narrow screens",
    },
    "console-navbar-identity": {
        classes: [
            "flex", "min-w-0", "items-center", "gap-3",
            "[&>*:last-child]:hidden", "sm:[&>*:last-child]:block",
        ],
        children: {
            brand: { leaf: ["heading", "brand-mark"] },
            context: { leaf: "text" },
        },
        why: "if you need the global navbar's product identity and console context to remain one leading run while narrow space keeps the brand primary",
    },
    "console-navbar-tools": {
        classes: ["flex", "shrink-0", "items-center", "justify-end", "gap-1", "md:[&>*:last-child]:hidden"],
        children: {
            locale: { leaf: "language-menu" },
            theme: { leaf: "theme-switch" },
            account: { leaf: "account-menu" },
            drawer: { leaf: "drawer-branch", optional: true },
        },
        why: "if you need one trailing run of capability-backed global tools, including the narrow destination trigger without inventing unsupported actions",
    },
    "sidebar-then-body-app": {
        /*
         * NO HOST, ON PURPOSE. A `nav` here would pull the routed body inside the navigation
         * landmark, which is the opposite of what the sibling relationship is for. The `nav` belongs
         * to the destination run alone.
         *
         * NO `gap`, ALSO ON PURPOSE. CollapsibleRail owns its inset and boundary while the routed
         * body owns its own content inset; a parent gap would state that seam a second time.
         */
        classes: [
            "flex", "w-full", "flex-col",
            "md:flex-row", "md:items-start",
            "md:[&>*:nth-child(2)]:min-w-0", "md:[&>*:nth-child(2)]:grow",
        ],
        children: {
            sidebar: { leaf: "collapsible-rail" },
            body: { contract: "console-body-main" },
        },
        why: "if you need the console's outer frame — a bounded collapsible destination rail standing as a sibling of the routed body, never its wrapper, so swapping the body on every navigation cannot take the way back with it",
    },
    "console-body-main": {
        host: "main",
        /*
         * `min-w-0` IS WRITTEN UNPREFIXED AS WELL AS INHERITED, and the duplication is the point.
         * The parent supplies it only through `md:[&>*:nth-child(3)]:min-w-0`, so below the breakpoint
         * nothing stops a long resource handle from pushing this column wider than the viewport.
         */
        classes: ["flex", "min-w-0", "w-full", "flex-col"],
        children: {
            /*
             * A LEAF, NOT A CONTRACT. Naming a page key here would read well and could never be
             * satisfied: the framework hands the layout an opaque `ReactNode`, and no `ReactNode`
             * narrows into a `ContractComponent`. LAYOUT-1 says the framework boundary closes
             * `children` into the contract's `page` leaf immediately, so this entry constrains which
             * ELEMENT the routed body opens rather than which page renders inside it.
             */
            page: { leaf: "page" },
        },
        why: "if you need the routed body marked once as the document's one main landmark, without adding any measure, seam or inset of its own",
    },
    "responsive-identity-kind-status-action-row": {
        classes: [
            "flex", "w-full", "flex-col", "gap-3",
            "md:flex-row", "md:items-start", "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow",
        ],
        children: {
            identity: { contract: "name-over-handle" },
            kind: { leaf: "badge", props: { tone: "neutral" } },
            status: { leaf: "badge" },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a resource identity, kind, lifecycle status and optional action to remain one ordered row when wide and stack in that same order when narrow",
    },
    /*
     * ── THE PAGE MEASURE, AND THE TWO BODIES ─────────────────────────────────────────────────────
     */
    "titled-section-stack-page": {
        /*
         * `max-w-4xl` RATHER THAN `max-w-6xl`, decided by the class union's own comment rather than
         * by taste: it reserves 56rem for a single-column operations page and 72rem for a
         * two-column one. Every destination this key serves is single-column.
         */
        classes: ["mx-auto", "flex", "w-full", "max-w-4xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            path: { leaf: "breadcrumbs", optional: true },
            heading: { contract: ["title-with-end-action", "title-with-baseline-fact", "title-over-description"] },
            /*
             * A SENTENCE, WHERE `title-with-baseline-fact` HOLDS ONLY A PHRASE. Its `fact` reads as
             * part of the heading's own line, so a page whose subject needs a full explanatory line
             * has nowhere legal to put one; this slot is that place, and it is optional because most
             * pages do not need it.
             */
            lede: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            /*
             * TWO, AND THE NUMBER IS READ THE WAY `auth-shortcuts-over-divider` reads its own: the
             * resting count is what the SKELETON draws before anything is known, so it must be true
             * on EVERY screen this key serves. Two rests short on the longest page and fills in,
             * where three would promise a section the shortest page never has.
             */
            section: {
                contract: ["label-row-over-card", "infrastructure-summary", "wallet-summary"],
                repeats: true,
                restingCount: 2,
            },
        },
        why: "if you need a single-column operations page with a heading and independently-loading labelled sections stacked one after another so one section refusing never nests inside, or reads as, another",
    },
    "wallet-waypoint-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-4xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            path: { leaf: "breadcrumbs", optional: true },
            heading: { contract: "title-with-end-action" },
            section: { contract: "label-row-over-card", repeats: true, restingCount: 4 },
        },
        why: "if Wallet can be entered as an exact-order waypoint and must keep its path above the page title while wallet-owned sections remain in their ordinary reading order.",
    },
    "module-detail-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-4xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            back: { leaf: ["text-link", "breadcrumbs"] },
            heading: { contract: "title-with-end-action" },
            lede: { leaf: "text", props: { size: "sm", tone: "muted" } },
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "if one nested module installation must preserve an exact workspace return before its title while summary and binding sections settle independently below.",
    },
    "console-primary-aside-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-8", "px-6", "py-8"],
        children: {
            path: { leaf: "breadcrumbs", optional: true },
            heading: { contract: "display-title-with-end-action" },
            lede: { leaf: "text", props: { size: "md", tone: "muted" }, optional: true },
            signals: { contract: "account-signal-grid", optional: true },
            content: { contract: "console-primary-aside" },
        },
        why: "if you need one complete console page with a stable heading and explanation above a primary work column and a narrower evidence or catalogue rail.",
    },
    "console-primary-aside": {
        classes: ["grid", "grid-cols-1", "gap-8", "lg:grid-cols-[minmax(0,1fr)_20rem]"],
        children: {
            primary: { contract: "console-section-stack" },
            aside: { contract: "console-section-stack" },
        },
        why: "if you need a primary work region beside a fixed-role evidence or catalogue rail when wide, with both retaining source order in one column when the primary track can no longer yield.",
    },
    "console-section-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-6"],
        children: {
            section: {
                contract: ["label-row-over-card", "infrastructure-summary", "wallet-summary"],
                repeats: true,
                restingCount: 2,
            },
        },
        why: "if you need peer console sections with independent states to keep one vertical reading order inside either the primary or secondary page region.",
    },
    "account-signal-grid": {
        classes: [
            "grid", "grid-cols-2", "gap-4", "lg:grid-cols-4",
            "[&>*:first-child]:col-span-2", "lg:[&>*:first-child]:col-span-4",
        ],
        children: {
            artwork: { leaf: "nivo-unicorn-artwork" },
            signal: { contract: "account-signal-card", repeats: true, restingCount: 4 },
        },
        why: "if one Nivo brand-artwork band introduces four independently settling account signals that align for comparison while showing named members and exact values instead of inventing collection totals.",
    },
    "account-signal-heading": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            mark: { leaf: "icon-tile", props: { size: "sm", tone: "accent" } },
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
        },
        why: "if one of four heterogeneous account-signal peers needs a semantic icon tile and compact label to identify its service kind before the current value.",
    },
    "account-signal-card": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            heading: { contract: "account-signal-heading" },
            value: { leaf: "text", props: { size: "sm" } },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if one compact ordinary surface in the account-signal peer set needs a service identity, one current named or exact value, and qualifying evidence without promoting every peer into a leading metric.",
    },
    "infrastructure-summary": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            heading: { contract: "title-with-end-action" },
            context: { leaf: "text" },
            domains: { contract: "labelled-fact-stack", optional: true },
            note: { contract: "body-with-refusal-note", optional: true },
        },
        why: "if the overview needs one independently settled infrastructure context derived from built services and domain expiry without inventing a standalone server total.",
    },
    "wallet-summary": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            facts: { contract: "labelled-fact-stack" },
            action: { leaf: "button", optional: true },
            note: { contract: "body-with-refusal-note", optional: true },
        },
        why: "if the overview needs one independently settled balance and unpaid-invoice summary whose wallet actions remain attached to the facts they affect.",
    },
    "body-with-refusal-note": {
        /*
         * `items-start` IS WHAT SEPARATES THIS FROM `empty-notice-stack`, which centres its column
         * and its text. A refusal is prose the reader is meant to act on rather than a centred
         * absence, and a sentence centred over a left-aligned answer reads as an apology for the
         * page instead of a note about one section of it.
         */
        classes: ["flex", "flex-col", "items-start", "gap-3", "p-4"],
        children: {
            /*
             * OPTIONAL, AND IT IS THE SLOT THAT MAKES THE `label-row-over-card` BODY EXTEND
             * SUFFICIENT. A section can be refused in one half and answered in the other - a pod
             * status throws while the workspace it belongs to answers normally - so the refusal sits
             * BESIDE what came back rather than replacing it. Without this slot the same drawing
             * would need `label-row-over-card` to admit a RUN of bodies, which reopens
             * `SurfaceCard`'s projection for a shape this slot already expresses.
             */
            answered: { contract: ["labelled-fact-stack", "fleet-resource-list", "inline-action-run"], optional: true },
            note: { leaf: "text", props: { size: "sm", tone: "muted" } },
            recovery: { leaf: "button", optional: true },
        },
        why: "if you need a section body that shows the server's own refusal sentence beside whatever part of it did answer, with an optional recovery action, instead of replacing the whole section with a centred empty state",
    },
    "horizontal-lifecycle-run": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-start", "gap-3"],
        children: {
            step: { composite: "lifecycle-step", repeats: true, restingCount: 4 },
        },
        why: "if you need a left-to-right run of lifecycle steps that wraps as whole steps on a narrow screen instead of clipping or turning into a second nav rail",
    },
    "responsive-five-stage-lifecycle-run": {
        classes: ["grid", "w-full", "grid-cols-1", "gap-3", "sm:grid-cols-5"],
        children: {
            step: { composite: "lifecycle-step", repeats: true, restingCount: 5 },
        },
        why: "if you need the five AgentOS lifecycle stages to compare in one row when wide and remain a complete ordered vertical sequence when narrow",
    },
    "responsive-four-stage-lifecycle-stepper": {
        classes: ["grid", "w-full", "grid-cols-1", "sm:grid-cols-4", "[&>*:not(:last-child)]:border-b", "sm:[&>*:not(:last-child)]:border-b-0", "sm:[&>*:not(:last-child)]:border-r", "[&>*]:border-separator"],
        children: {
            step: { composite: "lifecycle-step", repeats: true, restingCount: 4 },
        },
        why: "if you need four customer outcomes to stay one connected ordered sequence, with separators joining completed, current and upcoming markers horizontally when wide and vertically when narrow.",
    },
    "responsive-agentos-readiness-stepper": {
        classes: ["grid", "w-full", "grid-cols-1", "sm:grid-cols-5", "[&>*:not(:last-child)]:border-b", "sm:[&>*:not(:last-child)]:border-b-0", "sm:[&>*:not(:last-child)]:border-r", "[&>*]:border-separator"],
        children: {
            step: { composite: "lifecycle-step", repeats: true, restingCount: 5 },
        },
        why: "if provider credential, model, knowledge recovery, Qdrant and bounded AI test form one connected readiness spine horizontally when wide and vertically when narrow.",
    },
    "responsive-document-ingestion-stepper": {
        /*
         * DOCUMENT PROGRESS OFTEN LIVES IN THE STUDIO'S NARROW EVIDENCE RAIL.
         * Viewport-wide five/six-column steppers therefore receive less than a
         * word per column even on a desktop. Two columns keep each lifecycle
         * label intact in that rail; compact screens retain the ordered vertical
         * sequence instead of compressing the labels into one unreadable line.
         */
        classes: ["grid", "w-full", "grid-cols-1", "gap-2", "sm:grid-cols-2"],
        children: {
            step: { composite: "lifecycle-step", repeats: true, restingCount: 6 },
        },
        why: "if six uploaded-document stages must stay readable inside the Module Studio evidence rail without stacking labels on one line.",
    },
    "workspace-ai-readiness-summary": {
        classes: ["grid", "w-full", "grid-cols-1", "gap-4", "p-4", "sm:grid-cols-2", "items-center"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            status: { leaf: "badge" },
            facts: { contract: "ai-readiness-fact-stack" },
            actions: { contract: "inline-action-run" },
        },
        why: "if one workspace needs a compact source-owned AI verdict, safe configuration facts and bounded recovery/test actions without exposing provider secrets.",
    },
    "ai-readiness-fact-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            fact: { contract: "ai-readiness-fact-row", repeats: true, restingCount: 6 },
        },
        why: "if provider, model, embedding, credential, vector-store and test facts must remain fully readable even when technical values are longer than a compact workspace card.",
    },
    "ai-readiness-fact-row": {
        classes: ["grid", "min-w-0", "grid-cols-1", "gap-1", "sm:grid-cols-2"],
        children: {
            label: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm" } },
        },
        why: "if one AI readiness label and its owner-safe technical value must stack on a narrow screen and compare in aligned columns when space permits.",
    },
    "workspace-ai-knowledge-stack": {
        classes: ["grid", "w-full", "grid-cols-1", "gap-4"],
        children: {
            heading: { leaf: "heading" },
            summary: { contract: "workspace-ai-readiness-summary" },
            notice: { contract: "agentos-state-notice", optional: true },
            progress: { contract: "responsive-agentos-readiness-stepper" },
            evidence: { contract: "workspace-ai-evidence-grid" },
        },
        why: "if workspace AI readiness and source provenance are the dominant operating column while bounded component verdicts remain a scannable evidence aside.",
    },
    "workspace-ai-evidence-grid": {
        classes: ["grid", "w-full", "grid-cols-1", "gap-4", "lg:grid-cols-[minmax(0,1fr)_20rem]"],
        children: {
            origins: { contract: "knowledge-origin-list" },
            components: { contract: "readiness-component-list" },
        },
        why: "if knowledge origins need the dominant evidence column while bounded readiness verdicts remain readable beside them and move below on narrower screens.",
    },
    "knowledge-origin-list": {
        classes: ["flex", "w-full", "flex-col", "divide-y", "divide-separator"],
        children: {
            origin: { contract: "provenance-status-row", repeats: true, restingCount: 3 },
        },
        why: "if Nivo, installed-module and uploaded-document knowledge origins must compare as peer provenance rows with version, digest and document count.",
    },
    "readiness-component-list": {
        classes: ["flex", "w-full", "flex-col", "divide-y", "divide-separator"],
        children: {
            component: { contract: "provenance-status-row", repeats: true, restingCount: 5 },
        },
        why: "if provider, model, embedding, Qdrant and retrieval test verdicts need a bounded owner-safe evidence list beside the aggregate verdict.",
    },
    "provenance-status-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-3", "p-4", "md:flex-row", "md:items-start", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            status: { leaf: "badge" },
        },
        why: "if one owner-safe source or component identity needs its version and evidence caption kept whole beside one semantic verdict.",
    },
    "lifecycle-marker-over-label-and-state": {
        classes: ["flex", "min-w-0", "flex-col", "items-start", "gap-1", "p-4"],
        children: {
            marker: { leaf: "badge" },
            label: { leaf: "text" },
            state: { leaf: "text" },
        },
        why: "if you need one lifecycle marker to keep its ordinal, outcome label and semantic state in one readable unit while the parent owns the connector.",
    },
    "identity-phase-action": {
        classes: ["flex", "flex-col", "items-start", "gap-4", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            prompt: { leaf: "text", props: { size: "sm" } },
            body: { leaf: "text" },
            action: { leaf: "button", optional: true },
        },
        why: "if one order phase must keep its dominant product identity ahead of the phase prompt, consequence and optional primary action without letting the prompt enter the page outline.",
    },
    "provisioning-order-stack": {
        classes: ["flex", "w-full", "flex-col"],
        children: {
            order: { contract: "label-row-over-card" },
        },
        why: "if one AgentOS order must remain one labelled page section while its progress and phase-correct continuation share one surface.",
    },
    "provisioning-order-content": {
        classes: ["flex", "w-full", "flex-col"],
        children: {
            journey: { contract: ["responsive-four-stage-lifecycle-stepper", "responsive-agentos-readiness-stepper"] },
            continuation: { contract: "provisioning-phase-with-mark" },
        },
        why: "if one AgentOS order surface must keep its connected customer journey directly above the action that advances that same order.",
    },
    "provisioning-phase-with-mark": {
        classes: ["grid", "grid-cols-1", "items-center", "border-t", "border-separator", "sm:grid-cols-[minmax(0,1fr)_12rem]"],
        children: {
            details: { contract: "identity-phase-action" },
            artwork: { contract: "provisioning-brand-mark-cell" },
        },
        why: "if one order phase needs its identity, consequence and action beside one large product mark when wide while retaining the same source order in a narrow stack.",
    },
    "provisioning-brand-mark-cell": {
        classes: ["flex", "items-center", "justify-center", "p-4"],
        children: {
            mark: { leaf: ["icon", "tile-icon"] },
        },
        why: "if a single controlled product glyph closes the open edge of an order phase without becoming another content surface.",
    },
    "subject-over-muted-caption-with-action": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a subject-and-caption pair kept whole while a single optional action stays pinned to the far edge and wraps below rather than narrowing it.",
    },
    "request-beside-live-status": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "sm:[&>*:first-child]:col-span-2"],
        children: {
            journey: { contract: ["horizontal-lifecycle-run", "responsive-five-stage-lifecycle-run"] },
            request: { contract: ["form-column", "subject-over-muted-caption-with-action"] },
            status: { contract: ["heading-body-action-stack", "body-with-refusal-note"] },
        },
        why: "if you need a provisioning journey header above an immutable request identity placed beside its changing live status, so a status push never reads as a different request",
    },
    "template-offer-row": {
        /*
         * THE ENTRY CLOSEST TO `identity-kind-status-action-row`, and it stays a separate key on two
         * independent grounds rather than one. That row is this exact class list minus `flex-wrap`,
         * with slots identity/kind/status/action. The classes differ, AND the slot identities differ
         * where `status` is a badge and `price` is a text. The `props` literals and `restingCount`
         * are read past when two entries are compared, so the neutral tone on `kind` is NOT what
         * separates them; the class list and the slot names both are.
         *
         * `flex-wrap` also answers, for this new row only, the narrow-viewport overflow the older row
         * carries - the price cell is what pushes the line past the edge. It does not repair the
         * older row, which is a separate bounded fix.
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
             * REQUIRED here, where the owned row's action is optional. A resource mid-provision has
             * nothing anybody may do to it, but a catalogue entry with nothing to press is an
             * advertisement rather than an offer.
             */
            action: { leaf: "button" },
        },
        why: "if you need a catalogue row for something still for sale, showing identity, kind and price beside exactly one required purchase action, rather than a status a resource can be in",
    },
    "tabbed-control-center-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-8", "px-6", "py-8"],
        children: {
            heading: { contract: ["title-with-end-action", "agentos-page-heading"] },
            tabs: { leaf: "choice-tabs", optional: true },
            section: { contract: ["label-row-over-card", "workspace-overview-grid"], repeats: true, restingCount: 2 },
        },
        why: "if you need a single managed resource's control-center page with a heading, a tab switcher, and stacked sections that all stay in the main column rather than becoming sidebar navigation",
    },
    "workspace-overview-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "if you need stable workspace facts and measured runtime to compare as peer sections when wide while preserving their order in one column when narrow",
    },
    "module-summary": {
        classes: ["grid", "grid-cols-1", "gap-3", "sm:grid-cols-2", "sm:[&>*:last-child]:col-span-2"],
        children: {
            identity: { leaf: "text" },
            status: { leaf: "badge" },
            facts: { contract: "labelled-fact-stack" },
        },
        why: "if you need one immutable module installation identity, version, lifecycle state and optional failure code to read as one summary",
    },
    "module-bindings": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2"],
        children: {
            group: { contract: "binding-identity-list", repeats: true, restingCount: 4 },
        },
        why: "if you need generated agents, channel accounts, shared knowledge sources and knowledge versions from one immutable installation grouped as read-only bindings",
    },
    "binding-identity-list": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            name: { leaf: "heading" },
            identity: { leaf: "text", repeats: true, restingCount: 2 },
        },
        why: "if you need one named binding kind followed by its complete generated identifiers without turning those machine values into actions",
    },
    "status-action-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "sm:[&>*:only-child]:col-span-2"],
        children: {
            item: { composite: "status-action-card", repeats: true, restingCount: 2 },
        },
        why: "if you need a responsive grid of independent capability cards that sit side by side once there is width and stack whole on a phone",
    },
    "status-action-card": {
        classes: ["flex", "flex-col", "items-start", "gap-3", "p-4"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            state: { leaf: "badge" },
            detail: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: ["button", "action-link"] },
        },
        why: "if you need one capability card stating what it is, its current status and exactly one safe action, with refusal detail kept quiet and no credential-shaped value ever entering it",
    },
    "secure-launch-bridge-page": {
        classes: ["mx-auto", "flex", "min-h-screen", "w-full", "max-w-sm", "flex-col", "justify-center", "gap-6", "px-6", "py-8"],
        children: {
            heading: { leaf: "heading" },
            card: { contract: "status-action-card" },
            security: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if a short-lived application launch needs one bounded status surface, exact workspace identity and a credential-free consequence outside the persistent console chrome.",
    },
    "identity-action-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator"],
        children: {
            item: { contract: "avatar-identity-badge-action-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a joined list of identity rows, each with one status badge and one available action, without becoming separate cards.",
    },
    "domain-evidence-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator"],
        children: {
            fact: { contract: "label-value-row", repeats: true, restingCount: 2 },
        },
        why: "if you need comparable domain and runtime evidence rows to share one boundary so their labels and current values can be scanned without nesting a card per fact",
    },
    "workspace-runtime-stack": {
        classes: ["flex", "flex-col", "gap-6"],
        children: {
            metric: { composite: "labelled-progress-row", repeats: true, restingCount: 2 },
            facts: { contract: "labelled-fact-stack" },
            note: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need usage progress bars read first, followed by exact request/limit/health facts and an optional timestamp that marks the snapshot as a moment in time rather than live telemetry",
    },
    "helm-component-status-table": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            component: { composite: "helm-component-status-row", repeats: true, restingCount: 3 },
        },
        why: "if you need one joined vertical scan of Helm components so replica, image and health differences can be compared without nesting a card per component",
    },
    "helm-component-status-row": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "border-b", "border-separator", "py-3"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            kind: { leaf: "badge", props: { tone: "neutral" } },
            state: { leaf: "badge" },
            resources: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one Helm component's identity beside its kind, state and resource facts, wrapping instead of clipping on a narrow screen",
    },
})

/** Every key in the registry. A key not in this union is a compile error at the call site. */
export type ContractKey = keyof typeof CONTRACTS

/** Slot names whose contract entry declares a repeated run. */
type RepeatedSlotNames<K extends ContractKey> = {
    [S in keyof (typeof CONTRACTS)[K]["children"]]:
        (typeof CONTRACTS)[K]["children"][S] extends { readonly repeats: true } ? S : never
}[keyof (typeof CONTRACTS)[K]["children"]]

/**
 * Contracts a joined-list surface may host: a separated root made only from repeated slots.
 * The class and cardinality are both checked so a grid or a mixed header/list node cannot enter.
 */
export type JoinedListContractKey = {
    [K in ContractKey]:
        "divide-y" extends (typeof CONTRACTS)[K]["classes"][number]
            ? [RepeatedSlotNames<K>] extends [never]
                ? never
                : Exclude<keyof (typeof CONTRACTS)[K]["children"], RepeatedSlotNames<K>> extends never
                    ? K
                    : never
            : never
}[ContractKey]

/**
 * Read one entry, widened to the shared shape.
 *
 * @param name - The registry key to read.
 */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/** Resolve one contract into the props its branch places on the real layout node. */
export const contractNodeProps = (name: ContractKey) => {
    const spec = contractSpec(name)
    return {
        "data-tier": "branch",
        "data-node": name,
        "data-why": spec.why,
        className: spec.classes.join(" "),
    }
}

/** Every registry key, in declaration order, so gates and tests can walk the vocabulary. */
export const CONTRACT_KEYS: ReadonlyArray<ContractKey> = Object.keys(CONTRACTS) as Array<ContractKey>
