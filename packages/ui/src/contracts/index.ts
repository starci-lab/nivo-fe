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

/**
 * The closed set of classes a node may lay its children out with.
 *
 * `gap-[13px]` is not forbidden - it is UNREPRESENTABLE, because it is not a member. That single
 * property is what makes a whole family of patrol rules unnecessary: there is nothing to police
 * when the bad value cannot be typed.
 */
export type LayoutClassName =
    | "flex" | "grid" | "flex-col" | "flex-row" | "flex-wrap" | "overflow-hidden"
    | "items-center" | "items-baseline" | "items-start"
    | "justify-between" | "justify-center" | "[&>*]:w-full"
    | "gap-0" | "gap-1" | "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8"
    | "grid-cols-1" | "grid-cols-2" | "sm:grid-cols-2" | "lg:grid-cols-3"
    | "md:flex" | "md:flex-row" | "md:items-start"
    | "mx-auto" | "min-h-screen" | "w-full" | "min-w-0" | "grow" | "flex-1" | "hidden" | "max-w-app-lg" | "max-w-6xl" | "max-w-sm"
    | "h-16" | "min-h-16" | "sticky" | "top-0" | "top-16" | "z-40" | "z-50"
    | "border" | "border-b" | "border-separator" | "divide-y" | "divide-separator" | "bg-background"
    | "px-3" | "px-4" | "px-6" | "py-2" | "py-3" | "py-6" | "p-0" | "p-2" | "p-4" | "p-6"
    | "px-2" | "cursor-pointer" | "text-left" | "text-foreground" | "hover:opacity-80"
    | "rounded-xl" | "rounded-2xl" | "rounded-3xl"
    | "bg-surface" | "shadow-surface" | "text-center"
    | "[&>*:nth-child(2)]:min-w-0" | "[&>*:nth-child(2)]:grow"
    | "md:[&>*:first-child]:min-w-0" | "md:[&>*:first-child]:grow"
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:shrink-0"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-6"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "[&>*]:px-4" | "[&>*]:py-2" | "[&>*]:p-2" | "[&>*]:p-3" | "[&>*]:border-separator"
    | "[&>*:nth-child(odd)]:border-r" | "[&>*:nth-child(-n+4)]:border-b"
    | "[&>*:first-child]:w-5" | "[&>*:first-child]:shrink-0"
    | "[&>*:first-child]:text-center" | "[&>*:first-child]:tabular-nums"
    | "[&>*:first-child]:pt-4" | "[&>*:last-child]:pb-4"

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

/** One registry entry: a node's own classes, and why what it holds sits that way. */
export interface ContractSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: ReadonlyArray<LayoutClassName>
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
    "nav-over-body-page": {
        classes: ["flex", "min-h-screen", "w-full", "flex-col"],
        children: {
            navigation: { contract: "double-navbar" },
            body: { leaf: "page" },
        },
        why: "The navigation stays a sibling of the routed body rather than a parent of it, so a route change repaints the body without tearing the nav down - and the measure is set here because a reading column running the full width of a desktop screen cannot be scanned at all.",
    },
    "centred-authentication-page": {
        classes: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6"],
        children: {
            surface: { contract: "authentication-panel-card" },
        },
        why: "Authentication is the route's only task, so its one bounded form sits at the visual centre instead of inheriting the dashboard's rail-and-main reading order.",
    },
    "authentication-panel-card": {
        classes: ["w-full", "max-w-sm"],
        children: {
            panel: { contract: "centred-page-column" },
        },
        why: "The authentication form is one meaningful control group, so one card bounds it while the panel inside retains ownership of its typed form rhythm.",
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
    "heading-over-body": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            heading: { contract: ["underlined-tab-strip", "title-with-end-action"] },
            body: { contract: ["title-with-end-action", "rail-then-main"] },
            continuation: { contract: "rail-then-main", optional: true },
        },
        why: "The seam here is the only thing telling a reader that the content below belongs to this heading and not to the one above it.",
    },
    "stacked-sections": {
        classes: ["flex", "flex-col", "gap-6"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 0 },
        },
        why: "Sections read as separate objects only while the space between them is larger than the space inside any of them.",
    },
    "dashboard-tabs-over-body": {
        classes: ["flex", "w-full", "flex-col"],
        children: {
            tabs: { contract: "underlined-tab-strip" },
            body: { contract: "dashboard-rail-then-main" },
        },
        why: "The section tabs sit flush beneath the global navigation while the dashboard body keeps its own centred measure, matching the product shell without making the page title a second navigation layer.",
    },
    "dashboard-rail-then-main": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "dashboard-rail" },
            main: { contract: ["dashboard-main", "centred-empty-notice"] },
        },
        why: "The learner rail keeps the product's fixed 288px reading width beside a flexible main column, then stacks above it on a narrow screen without becoming a card or a sticky viewport of its own.",
    },
    "dashboard-rail": {
        classes: ["flex", "w-full", "flex-col", "gap-6"],
        children: {
            section: { contract: ["stacked-stat-rows", "label-row-over-card"], repeats: true, restingCount: 2 },
        },
        why: "Identity facts and quick destinations form one bare 288px rail, so their labels align without an enclosing surface that would make the rail compete with the content cards.",
    },
    "dashboard-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: ["label-row-over-card", "explore-main"], repeats: true, restingCount: 8 },
        },
        why: "The production overview has eight product sections in a fixed reading order. They repeat at the product's 24px seam so each labelled surface reads as a separate part of the learner's overview rather than one long card; a refactor may not invent another section from data the product does not display.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            body: { contract: "$content" },
        },
        why: "The label is held OUTSIDE the surface it names, so a section whose content is itself a set of cards never draws a card inside a card - and the seam is tighter than the seam between sections, because the label and the surface under it are one object.",
    },
    "empty-notice-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "The recovery notice needs one bounded ground beneath the section label so its message and way out read as the section's answer rather than as another section beside it.",
    },
    "empty-notice-stack": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "text-center"],
        children: {
            mark: { leaf: "icon-tile", optional: true },
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "A mark appears only when the legacy product gives the absence a generic visual identity; the settled answer and optional recovery action keep one centred reading order either way.",
    },
    "resume-item-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-3xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            title: { leaf: "text", props: { size: "md", weight: "medium" } },
            kind: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resume: { leaf: "see-more-link", optional: true },
        },
        why: "The kind, title and way back into one content item share a bounded ground because none identifies the resumable item without the other two.",
    },
    "daily-quest-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            tasks: { contract: "stacked-peer-controls" },
            outcome: { leaf: ["text", "button"] },
        },
        why: "The day's task run and its reward outcome share a bounded ground because the outcome only has meaning as the result of that run.",
    },
    "weekly-challenge-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            title: { composite: "weekly-challenge-title" },
            status: { composite: "weekly-challenge-status" },
            passed: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            finishers: { contract: "weekly-challenge-finishers", optional: true },
        },
        why: "The challenge title, timing/status, pass count and recent finishers are one bounded challenge story; the finisher rows become a nested joined list only when the story has entries.",
    },
    "weekly-challenge-title": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full"],
        children: {
            glyph: { leaf: "icon", optional: true },
            title: { leaf: "text" },
        },
        why: "The challenge identity is one title line: the generic practice glyph leads the title and disappears during loading without changing the line's contract.",
    },
    "weekly-challenge-status": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-3", "w-full"],
        children: {
            endsIn: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: ["button", "badge"] },
        },
        why: "The countdown and the viewer's one available outcome share a single action row, so the outcome never becomes a second challenge section.",
    },
    "weekly-challenge-finisher-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full"],
        children: {
            avatar: { leaf: "avatar" },
            name: { leaf: "text" },
            passedAt: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A recent finisher is identified by avatar and username with relative time trailing on the same baseline; it is not a generic account stat row.",
    },
    "weekly-challenge-finishers": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            finisher: { composite: "weekly-challenge-finisher-row", repeats: true, restingCount: 3 },
        },
        why: "Recent finishers are peers of one nested joined list: the full-width separators belong between rows, while avatar, username and relative time stay on each row.",
    },
    "job-readiness-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            percentile: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            metrics: { contract: "job-readiness-list" },
            action: { leaf: "button", optional: true },
        },
        why: "The readiness list owns its summary label and trailing band, while supporting percentile and next action remain outcomes of the whole assessment; the inner joined list is outlined because the outer card already supplies elevation.",
    },
    "job-readiness-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            row: { composite: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "The scored readiness pillars are peers of one nested joined list, so one outlined surface and full-width rules preserve their shared result without adding a second shadow.",
    },
    "daily-quest-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            task: { composite: "task-progress-row", repeats: true, restingCount: 5 },
        },
        why: "Today's tasks are peer rows of one joined list, so the surface is shared and a full-width rule - rather than card spacing - separates one target from the next.",
    },
    "rank-title-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            rank: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            title: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "A ranked discovery result keeps its compact rank beside one actionable title; the title owns spare width while the fixed rank column remains comparable down the joined list.",
    },
    "avatar-identity-badge-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "name-over-handle" },
            badge: { leaf: "badge", optional: true },
            action: { leaf: "button" },
        },
        why: "A suggested identity is recognised first, qualified only when needed, and acted on last; the name stack therefore owns the flexible middle between avatar and follow action.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-0"],
        children: {
            name: { leaf: "text-link", props: { size: "sm" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle identifies the name without competing with it, so the two stay in one tight vertical identity stack.",
    },
    "activity-actor-body-time-row": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            body: { contract: "activity-sentence-over-reaction" },
            time: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "An activity reads as actor, event and quiet timestamp on one row; the event owns the flexible middle while identity and recency stay visible at its edges.",
    },
    "activity-sentence-over-reaction": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            sentence: { contract: "activity-actor-action-target-sentence" },
            reaction: { leaf: "reaction-picker", optional: true },
        },
        why: "The optional reaction responds to the complete activity sentence, so it sits directly beneath that sentence rather than beside one fragment of it.",
    },
    "activity-actor-action-target-sentence": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            actor: { leaf: "text-link", props: { size: "sm" } },
            action: { leaf: "text", props: { size: "sm" } },
            target: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "Actor, action and optional target form one readable sentence, so they wrap together while preserving the two actionable names.",
    },
    "contribution-calendar-stack": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            heading: { contract: "contribution-calendar-heading-row" },
            grid: { leaf: "contribution-grid" },
            footer: { contract: "contribution-calendar-footer-row" },
        },
        why: "The year summary, one intrinsic contribution plot and its reading key form a single fixed visualization, so the composite closes those three regions without owning their DOM mechanics.",
    },
    "contribution-calendar-heading-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            total: { leaf: "text", props: { size: "xs", tone: "muted" } },
            years: { leaf: "choice-tabs" },
        },
        why: "The activity total identifies the plot while the peer year choices change its time window, so they share one header row without either becoming part of the grid mechanics.",
    },
    "contribution-calendar-footer-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            streak: { leaf: "text", props: { size: "sm" } },
            intensity: { leaf: "contribution-intensity-legend" },
        },
        why: "The streak result and the intensity key explain the same plot from opposite ends of one footer, while the plot itself remains an intrinsic leaf.",
    },
    "trending-content-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            item: { composite: "trending-content-row", repeats: true, restingCount: 6 },
        },
        why: "Trending content is one ranked joined list, so full-width rules preserve the scan from rank to title without turning every result into a card.",
    },
    "activity-feed-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            activity: { composite: "activity-row", repeats: true, restingCount: 3 },
        },
        why: "Activities on one day are peers in one joined list, so their actor, event and response remain rows separated by full-width rules.",
    },
    "suggested-user-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            user: { composite: "suggested-user-row", repeats: true, restingCount: 4 },
        },
        why: "Suggested people are one scan of comparable identities, so one joined surface and full-width rules keep profile and follow action together.",
    },
    "explore-main": {
        classes: ["flex", "flex-col", "gap-6", "w-full"],
        children: {
            feed: { contract: "feed-explorer" },
            suggestions: { contract: "suggested-user-list", optional: true },
        },
        why: "Discovery feed and follow suggestions are independent product blocks, so the page keeps one large seam between their separate request lifetimes.",
    },
    "feed-explorer": {
        classes: ["flex", "flex-col", "gap-6", "w-full"],
        children: {
            trending: { contract: "trending-content-list", optional: true },
            stream: { contract: "feed-stream" },
        },
        why: "Trending and the controlled activity stream are major discovery regions; each keeps its own state and a large page seam.",
    },
    "feed-stream": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            filters: { contract: "dual-filter-tabs-card" },
            feed: { contract: "activity-feed-result" },
            paginationError: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            pagination: { leaf: "button", optional: true },
        },
        why: "The two feed filters directly govern the day-grouped results below, so their seam is tighter than the seam between independent dashboard blocks.",
    },
    "activity-feed-result": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            day: { contract: "activity-feed-list", repeats: true, restingCount: 2, optional: true },
            notice: { contract: "empty-notice-card", optional: true },
        },
        why: "A feed settles into day-grouped joined lists or one explicit empty/error result; both occupy the same governed result region below its filters.",
    },
    "dual-filter-tabs-card": {
        classes: ["overflow-hidden", "w-full", "rounded-2xl", "border", "border-separator", "bg-surface", "divide-y", "divide-separator", "[&>*]:p-2"],
        children: {
            scope: { leaf: "choice-tabs" },
            category: { leaf: "choice-tabs" },
        },
        why: "Scope and category filter the same result set, so one bordered card groups both controlled axes while a full-width divider keeps their independent meanings legible.",
    },
    "changelog-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-2", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            entry: { composite: "changelog-entry-row", repeats: true, restingCount: 4 },
        },
        why: "Changelog entries are dated peers of one joined history, so a full-width rule separates releases while one shared surface keeps their date, category, title and body in the same reading column.",
    },
    "changelog-entry-row": {
        classes: ["flex", "w-full", "flex-col", "gap-2"],
        children: {
            meta: { contract: "date-category-row" },
            title: { leaf: ["text", "text-link"], props: { size: "sm" } },
            body: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "A changelog entry reads as one closed dated statement: its date and category qualify the title, while the smaller muted body explains that same update beneath it.",
    },
    "date-category-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            date: { leaf: "text", props: { size: "xs", tone: "muted" } },
            category: { leaf: "badge", optional: true },
        },
        why: "The date and category are peer metadata for one update, so they share a compact line before the update title begins.",
    },
    "contribution-calendar-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            calendar: { composite: "contribution-calendar" },
        },
        why: "The year choice, activity grid, intensity key and streak caption explain one another, so they stay in one bounded calendar surface rather than becoming four dashboard sections.",
    },
    "weekly-goals-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            summary: { leaf: "text", props: { size: "sm", weight: "medium" } },
            goals: { contract: "bordered-goal-grid" },
        },
        why: "The week's summary and six comparable goals share one bounded ground; the summary qualifies the grid as a whole rather than pretending to be a seventh metric.",
    },
    "bordered-goal-grid": {
        classes: ["grid", "grid-cols-2", "overflow-hidden", "rounded-3xl", "border", "border-separator", "[&>*]:p-3", "[&>*:nth-child(odd)]:border-r", "[&>*:nth-child(-n+4)]:border-b", "[&>*]:border-separator"],
        children: {
            goal: { composite: "labelled-progress-row", repeats: true, restingCount: 6 },
        },
        why: "Weekly goals are compact peer measures read across two columns. A full outer border and shared row and column seams keep all six cells one grid instead of six cards.",
    },
    "course-progress-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            rows: { contract: "progress-row-stack" },
        },
        why: "The course progress rows share one bounded ground because they are peer measures of the same enrolled set rather than separate cards.",
    },
    "streak-summary-card": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            summary: { contract: "streak-week-with-outcome" },
            nudge: { contract: "streak-daily-nudge", optional: true },
        },
        why: "The seven-day run and the next learning action share one bounded ground because the action explains how a quiet day becomes an active one.",
    },
    "streak-week-with-outcome": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            week: { composite: "streak-week-run" },
            outcome: { contract: ["streak-empty-prompt", "streak-active-summary"] },
        },
        why: "The seven day marks stay together at the start while their meaning and next action stay together at the end, matching the production strip without reserving a false fixed-width aside.",
    },
    "streak-week-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-3"],
        children: {
            day: { leaf: "day-cell", repeats: true, restingCount: 7 },
        },
        why: "Seven day cells form one fixed week run, so they move as one compact sequence rather than each caller rebuilding the row and its resting count.",
    },
    "streak-empty-prompt": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-4"],
        children: {
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button", props: { size: "sm", variant: "primary" } },
        },
        why: "The explanation and the one action that resolves it are one prompt, so they remain adjacent instead of being split into a detached dashboard statistic.",
    },
    "streak-active-summary": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            current: { leaf: "text", props: { size: "sm", weight: "medium" } },
            record: { leaf: "badge" },
        },
        why: "The current run and record are one compact reading, so neither receives a separate column, an invented fixed width or a decorative business glyph.",
    },
    "streak-daily-nudge": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            message: { leaf: "text", props: { size: "sm", weight: "medium" } },
            action: { leaf: "button", props: { size: "sm", variant: "primary" } },
        },
        why: "When an existing streak is still idle today, its reminder and preserving action form one decision row beneath the week rather than another dashboard section.",
    },
    "progress-row-stack": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            row: { composite: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "Progress rows repeat down one column so their labels and figures can be compared without each row pretending to be a separate section.",
    },
    "glyph-title-fact-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "md", tone: "default" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The glyph identifies the row faster than its name does, so it leads the line and the fact trails it - and the name between them takes the slack, because a long one must clip rather than push the figure off the end of the row.",
    },
    "task-mark-title-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon" },
            title: { leaf: "text" },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The completion mark identifies task state, the title owns the flexible middle, and the quiet target remains aligned at the far edge of every joined row.",
    },
    "label-fact-over-progress": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            line: { contract: "label-with-muted-fact-row" },
            progress: { leaf: "progress" },
        },
        why: "The figure belongs to the label while the bar explains that pair, so the line stays directly above its measure.",
    },
    "glyph-body-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "rounded-xl", "px-4", "py-3"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            body: { leaf: "text" },
            action: { leaf: ["button", "see-more-link"] },
        },
        why: "A row a reader can act on needs its own inset so the press target is the row and not the words inside it.",
    },
    "label-value-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm" } },
        },
        why: "The label and its figure sit at opposite ends of one line so a column of them reads as a table without being one, and they share a baseline so the figure does not float against its own name.",
    },
    "label-with-muted-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A joined list may qualify its own rows with a semibold label and a smaller muted fact on one baseline; without peer identities outside the list there is no reason to add a leading glyph.",
    },
    "label-over-figure-tile": {
        classes: ["flex", "flex-col", "gap-2", "rounded-2xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            label: { leaf: "text", props: { size: "sm", tone: "muted" } },
            figure: { leaf: "text" },
        },
        why: "The label reads first and small, the figure second and large, because a reader scanning a row of these is comparing figures and needs the names only to know which is which.",
    },
    "resume-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-3", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: {
            card: { contract: "resume-item-card", repeats: true, restingCount: 3 },
        },
        why: "Resume cards retain the legacy one/two/three-column run: one on a phone, two at the middle measure, and three beside the dashboard rail so the next choices remain comparable without shrinking their copy.",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            label: { leaf: "label" },
            field: { leaf: ["input", "field"] },
            hint: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "The hint belongs under the control it explains rather than beside the label, because a reader reaches the hint after failing at the control and not before trying it.",
    },
    "form-column": {
        classes: ["flex", "w-full", "max-w-sm", "flex-col", "gap-3"],
        children: {
            field: { contract: "label-field-hint", repeats: true, restingCount: 3 },
            submit: { leaf: "button" },
        },
        why: "A form is read one control at a time, so the measure is narrow on purpose and the seam between controls is wider than the seam inside any of them.",
    },
    "double-navbar": {
        classes: ["sticky", "top-0", "z-50", "w-full", "border-b", "border-separator", "bg-background"],
        children: {
            primary: { contract: "brand-links-then-tools-bar" },
            bottom: { contract: "underlined-tab-strip", optional: true },
        },
        why: "The active page's tab strip is the navbar's second layer, so both rows move as one sticky landmark and share one bottom border instead of drawing two unrelated bars.",
    },
    "brand-links-then-tools-bar": {
        classes: ["flex", "h-16", "min-h-16", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-3"],
        children: {
            navigation: { contract: "inline-nav-links" },
            tools: { contract: "inline-tool-row" },
        },
        why: "The mark and the routes read left because that is where a reader looks to learn where they are; the tools read right because that is where they look to change something - and the bar wraps rather than letting either group fall off a narrow screen.",
    },
    "inline-nav-links": {
        classes: ["flex", "flex-row", "items-center", "gap-6"],
        children: {
            brand: { leaf: "link", props: { emphasis: "brand" } },
            routes: { contract: "inline-route-links" },
        },
        why: "The product mark and its destination group keep the legacy 24px seam, so the brand is distinct without becoming detached from the routes it anchors.",
    },
    "inline-route-links": {
        classes: ["hidden", "flex-1", "items-center", "justify-center", "gap-2", "md:flex"],
        children: {
            route: { leaf: "nav-link", props: { kind: "route" }, repeats: true, restingCount: 0 },
        },
        why: "Desktop route pills sit at the original 8px seam and disappear together below the navigation breakpoint, where the compact shell owns navigation instead.",
    },
    "inline-tool-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            desktop: { contract: "desktop-navbar-tools" },
            tool: { leaf: ["icon-button", "account-menu"], repeats: true, restingCount: 3 },
        },
        why: "The desktop field controls and round action buttons share one centred row, so controls with different intrinsic heights still sit on the same navbar axis.",
    },
    "desktop-navbar-tools": {
        classes: ["hidden", "items-center", "gap-2", "md:flex"],
        children: {
            search: { leaf: "pressable-input-like" },
            locale: { leaf: "icon-button" },
            theme: { leaf: "theme-switch" },
        },
        why: "Search, language and appearance are the legacy desktop subgroup, whose own centred flex axis prevents the shorter native switch track from dropping against neighbouring buttons.",
    },
    "underlined-tab-strip": {
        classes: ["w-full"],
        children: {
            tabs: { leaf: "extended-tabs" },
        },
        why: "The original ExtendedTabs primitive owns the inset, compound tab anatomy and selected indicator as one typed run, so no caller can redraw one dashboard tab differently from its peers.",
    },
    "rail-then-main": {
        classes: ["flex", "flex-col", "gap-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:first-child]:sticky", "md:[&>*:first-child]:top-6", "md:[&>*:first-child]:self-start", "md:[&>*:first-child]:max-h-rail", "md:[&>*:first-child]:overflow-y-auto", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "stacked-sections" },
            main: { contract: ["stacked-sections", "centred-empty-notice"] },
        },
        why: "The rail is pinned in width and STAYS while the column beside it scrolls, because it holds who the reader is and where they can go - facts that do not stop being true a screenful down - and a rail that shrank with the window would clip its own labels before the content beside it became hard to read. Below the breakpoint it moves above rather than halving the column, where sticking it would cost a phone most of its screen.",
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
        why: "A surface read one control at a time is centred and narrow on purpose: a form that runs the width of a desktop screen makes the eye travel between a label and the box it names.",
    },
    "auth-entry-stack": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcuts: { contract: "auth-shortcuts-over-divider" },
            credentials: { leaf: "form" },
        },
        why: "Authentication has exactly two entry blocks: OAuth closed by the OR divider above, and the credential form below. This node alone owns their gap-3 seam so the outer page rhythm cannot add a second gap.",
    },
    "centred-title-pair": {
        classes: ["flex", "flex-col", "gap-2", "items-center", "text-center"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
        },
        why: "The supporting line sits under the title rather than beside it, because it explains the title rather than qualifying it - and both are centred so the pair reads as the surface's own name rather than as the first row of its content.",
    },
    "auth-shortcuts-over-divider": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcut: { leaf: "button", repeats: true, restingCount: 2 },
            divider: { leaf: "divider" },
        },
        why: "OAuth shortcuts and the OR divider are one alternative-entry cluster: the divider closes the shortcut choice before the credential form begins, so it keeps the cluster's gap rather than the larger seam between form groups.",
    },
    "stacked-peer-controls": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            control: {
                contract: "spread-choice-row",
                leaf: ["button", "quick-action-row", "quick-actions-list", "text"],
                composite: ["field", "labelled-progress-row", "stat-row"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "Controls of the same kind repeat down one column, and the seam between them is tighter than the seam between groups, so a reader can tell a run of peers from two separate decisions.",
    },
    "stacked-stat-rows": {
        classes: ["flex", "flex-col", "gap-0", "p-2", "[&>*]:w-full"],
        children: {
            stat: { composite: "stat-row", repeats: true, restingCount: 3 },
        },
        why: "Standing figures are consecutive rows of one identity list, so no gap interrupts the scan while one p-2 inset gives the whole streak-credit-coins cluster its legacy breathing room.",
    },
    "profile-over-stat-rows": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            profile: { composite: "profile-row" },
            stats: { contract: "stacked-stat-rows" },
        },
        why: "The person anchors the identity cluster before their three standing figures, and the profile-to-list seam is wider than the zero seam between rows because those are two groups.",
    },
    "profile-avatar-name-handle-disclosure-row": {
        classes: ["flex", "w-full", "cursor-pointer", "flex-row", "items-center", "justify-between", "gap-3", "px-2", "py-2", "text-left", "text-foreground", "hover:opacity-80", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "profile-name-over-handle" },
            disclosure: { leaf: "icon" },
        },
        why: "The avatar identifies the profile, the name stack owns the available width, and the trailing disclosure makes the whole row's destination explicit.",
    },
    "profile-name-over-handle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-0"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle qualifies the display name without competing with it, so both remain one tight identity stack.",
    },
    "spread-choice-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            choice: { leaf: ["checkbox", "text-link"] },
            exit: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "A choice and the way out of it are pushed to opposite ends of one line, because they are peers that a reader picks BETWEEN rather than a label and the thing it names.",
    },
    "centred-prompt-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "A question and its answer read as one sentence, so they share a line and are centred together - split across two lines they read as two separate offers.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "rounded-2xl", "bg-surface", "p-4", "text-center", "shadow-surface"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
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
