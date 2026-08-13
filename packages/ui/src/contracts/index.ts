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
    | "justify-between" | "justify-center" | "[&>*]:w-full" | "[&>*]:max-w-sm"
    | "gap-0" | "gap-1" | "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8"
    | "grid-cols-1" | "grid-cols-2" | "sm:grid-cols-2" | "lg:grid-cols-3"
    | "md:flex" | "md:flex-row" | "md:items-start"
    | "mx-auto" | "min-h-screen" | "w-full" | "min-w-0" | "grow" | "flex-1" | "hidden" | "max-w-app-lg" | "max-w-6xl" | "max-w-sm"
    // The two reading measures between the form width and the dashboard width. `max-w-sm` is a
    // control column and `max-w-6xl` is a two-column page at 72rem; a band of prose read straight
    // down needs 48rem, and a single-column operations page needs 56rem. Neither is expressible by
    // rounding to a neighbour: at `max-w-sm` a paragraph becomes a ladder, and at `max-w-6xl` the
    // eye loses the start of the next line. `max-w-app-lg` is NOT the answer here - it is declared
    // in this union but has no theme definition anywhere in the repository, so it compiles to
    // nothing at all.
    | "max-w-3xl" | "max-w-4xl"
    | "h-16" | "min-h-16" | "sticky" | "top-0" | "top-16" | "z-40" | "z-50"
    | "border" | "border-b" | "border-separator" | "divide-y" | "divide-separator" | "bg-background"
    | "px-3" | "px-4" | "px-6" | "py-2" | "py-3" | "py-6" | "py-8" | "p-0" | "p-2" | "p-4" | "p-6"
    | "px-2"
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
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:shrink-0"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-6"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "[&>*]:px-4" | "[&>*]:py-3" | "[&>*]:p-2" | "[&>*]:p-3" | "[&>*]:border-separator"
    | "[&>*:nth-child(odd)]:border-r" | "[&>*:nth-child(-n+4)]:border-b"
    | "[&>*:first-child]:w-5" | "[&>*:first-child]:shrink-0"
    | "[&>*:first-child]:text-center" | "[&>*:first-child]:tabular-nums"
    | "[&>*:first-child]:pt-4" | "[&>*:last-child]:pb-4"
    // The unprefixed pair. `md:[&>*:first-child]:min-w-0` and its `grow` twin were already here for
    // the rail layouts, which only take the flexible-first shape above the md breakpoint; a row
    // whose FIRST child takes the slack at every width needs the same two names without the prefix.
    | "[&>*:first-child]:min-w-0" | "[&>*:first-child]:grow"

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
export type ContractHostTag = "div" | "main" | "nav" | "ul" | "ol" | "form" | "section" | "aside"

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
        why: "Authentication is the route's only task, so its one bounded form sits at the visual centre instead of inheriting the dashboard's rail-and-main reading order.",
    },
    "centred-viewport-main": {
        // The document's one main landmark. The key's name has said so all along; now the entry
        // does, instead of a second frame component existing to swap the tag.
        host: "main",
        classes: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6"],
        children: {
            content: { contract: "centred-title-pair" },
        },
        why: "A route whose whole content is one short statement puts it at the optical centre of the viewport rather than at the top, because a single centred pair reads as the screen's subject while the same pair pinned to the top reads as the first row of a list that never arrives.",
    },
    "authentication-panel-card": {
        classes: ["w-full", "max-w-sm", "p-4"],
        children: {
            panel: { contract: "centred-page-column" },
        },
        why: "The authentication form is one meaningful control group, so one card bounds it while the panel inside retains ownership of its typed form rhythm; the inset is written HERE because a card is a vendor ground with no opinion about the entry standing on it, and an inset borrowed from that ground would make the same key read one way inside a surface branch and another way on its own.",
    },
    "academy-band-run": {
        // The academy's routed body is the main landmark. Its class list stays empty because the
        // bands inside own their own rhythm; the element is the meaning, not the spacing.
        host: "main",
        classes: [],
        children: {
            band: { composite: "academy-band", repeats: true, restingCount: 0 },
        },
        why: "Each configured band already sets its own full-bleed inset, alternating ground and closing rule, so the landmark that stacks them adds no measure, gap or padding of its own; a seam written here would double every band border and stop the last rule on the page from being the last one a reader sees.",
    },
    "banded-measure-column": {
        classes: ["w-full", "border-b", "border-separator", "px-6", "py-6"],
        children: {
            column: { contract: "stacked-band-parts" },
        },
        why: "A landing page is one uninterrupted scroll, so the only thing telling a reader that one promise has ended and the next has begun is a rule that runs the full width of the screen - which is why it lives on this node and not on the reading column inside it, where the same rule would read as a divider within the section rather than the end of it.",
    },
    "banded-measure-column-on-surface": {
        classes: ["w-full", "border-b", "border-separator", "px-6", "py-6", "bg-surface"],
        children: {
            column: { contract: "stacked-band-parts" },
        },
        why: "Alternating bands take a second ground so a reader can count sections without reading them; it is a second KEY rather than a boolean prop because the class string belongs to the registry, and a band whose ground is chosen at render time has two owners and nothing that can read it back.",
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
        why: "One band makes one point, so its parts are read top to bottom at a single seam and the measure is capped here: prose running the full width of a desktop screen loses the start of the next line, and every band on this page is prose first.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            title: { leaf: "heading" },
            end: { leaf: ["button", "see-more-link"], optional: true },
        },
        why: "The control sits at the far end of the title's line so the eye finds the name first and the action second, and it drops under the title rather than squeezing it when the line runs out.",
    },
    "inline-action-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "The presses a section offers sit on one line in the order a reader should weigh them, and the line wraps rather than stretching them - a lone button left in a stacking column grows to the column's whole width and stops reading as a press at all.",
    },
    "title-with-baseline-fact": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The fact reads as part of the heading sentence, so it sits on the title's baseline and wraps under it instead of pushing the title narrow.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            /*
             * `$content` USED TO SIT HERE, AND NOTHING COULD EVER FILL IT. It is not a ContractKey, so
             * `ContractChild` resolved it to `never` and every attempt to render this node with a
             * body was a type error. The key survived because it is only ever referenced AS a child
             * by `stacked-sections`, `dashboard-main` and `dashboard-rail` - nobody had rendered one
             * directly yet, so the placeholder never had to answer for itself.
             *
             * Replaced with the bodies a section actually holds. A leaf is admitted beside them
             * because an empty or failed section says its one sentence in the same column its rows
             * would have used, exactly as `titled-summary-filter-over-body-page` already allows.
             */
            body: {
                contract: [
                    "labelled-fact-stack", "inline-action-run", "fleet-resource-list",
                    "stacked-stat-rows", "claim-panel-grid", "progress-row-stack", "centred-empty-notice",
                    // A named section drawn around one attributed claim. It was already drawn that
                    // way at a real call site and this list did not say so, which is how the branch
                    // ended up wearing the section on a box of its own rather than rendering it.
                    "attributed-claim-panel",
                ],
                leaf: "text",
            },
        },
        why: "The label is held OUTSIDE the surface it names, so a section whose content is itself a set of cards never draws a card inside a card; label and owned surface use the ordinary gap-3 seam while major sections remain farther apart.",
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
    "rank-title-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            rank: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            title: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "A ranked discovery result keeps its compact rank beside one actionable title; the title owns spare width while the fixed rank column remains comparable down the joined list.",
    },
    "step-number-then-instruction": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            ordinal: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            instruction: { leaf: "text", props: { size: "sm" } },
        },
        why: "The step numbers form a column a reader counts down, so they hold one fixed tabular width while the instruction takes all the slack; a number that shifts with the length of its own sentence stops reading as a sequence and starts reading as punctuation.",
    },
    "numbered-step-stack": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            step: { contract: "step-number-then-instruction", repeats: true, restingCount: 4 },
        },
        why: "A roadmap is ordered, so this node is the list a reader is meant to walk in sequence; its ordinal is part of the meaning rather than decoration, which is what separates it from the unordered credential run that wears almost the same classes.",
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
    "avatar-identity-rating-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "subject-over-muted-caption" },
            rating: { leaf: "rating", optional: true },
        },
        why: "A testimonial is believed because of who said it, so the face is recognised first, the name owns the flexible middle and the score trails at the far edge; the rating lands there because the middle grows into the gap rather than because anybody pushed it.",
    },
    "identity-kind-status-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            identity: { contract: "name-over-handle" },
            kind: { leaf: "badge", props: { tone: "neutral" } },
            status: { leaf: "badge" },
            action: { leaf: "button", optional: true },
        },
        why: "A row in a mixed fleet has to answer WHAT it is before WHAT STATE it is in, so kind and status are two badges rather than one sentence: kind never changes and is fixed to the neutral tone, status changes constantly and owns the tone. Collapsing them would let a merely suspended resource read as a different kind of thing from a running one. There is deliberately NO leading glyph: the kind badge already carries that answer, and a figure repeating it would be the second place a reader has to look to learn one fact. The action is optional because a resource mid-provision has nothing anybody may do to it, and an always-present button drawn disabled promises a control that does not exist rather than admitting there is none.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-0"],
        children: {
            name: { leaf: "text-link", props: { size: "sm" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle identifies the name without competing with it, so the two stay in one tight vertical identity stack.",
    },
    "subject-over-muted-caption": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            subject: { leaf: ["heading", "text", "image-frame"] },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A caption explains the thing above it rather than qualifying it from the side, so the pair stays one tight vertical unit and the caption never competes for the subject's line - the same reason the handle sits under a name, generalised to the three subjects a marketing page captions: a person, a figure and a photograph.",
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
        classes: ["flex", "flex-col", "gap-3"],
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
    "fleet-resource-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            // KNOWN TIER MISMATCH, recorded rather than hidden: `fleet-row` is a BLOCK (it reads
            // nivo's provisioning states), but a child slot may only name a leaf, a composite or a
            // contract. Declaring it `composite` is what makes the slot expressible today; the tier
            // that is true lives on the component's own `meta.shape`. Whether this spec needs a
            // fourth kind is a canon decision, not one to settle by relabelling the component.
            resource: { composite: "fleet-row", repeats: true, restingCount: 3 },
        },
        why: "Two kinds of provisioned thing are compared in one scan, so they share one joined surface and full-width rules rather than sitting in two shelves that would make their differing lifecycles look like differing importance.",
    },
    "titled-summary-filter-over-body-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            heading: { contract: "title-with-end-action" },
            summary: { contract: "stacked-stat-rows", optional: true },
            filter: { contract: "choice-tab-strip" },
            body: { contract: "label-row-over-card", leaf: "text" },
        },
        why: "A page that filters a collection has to put the filter where a reader meets it AFTER the totals and BEFORE the rows, because a control placed under what it changes reads as belonging to the last row rather than to the list. The summary is optional and the filter is not: totals vanish honestly when there is nothing to count, while a filter that disappears with its rows would take the way back with it. The body admits a text leaf so an empty or failed page says its sentence in the same column the rows would have used, rather than in a shape of its own.",
    },
    "choice-tab-strip": {
        classes: ["w-full"],
        children: {
            tabs: { leaf: "choice-tabs" },
        },
        why: "A single filter axis owns one strip. `underlined-tab-strip` already holds the compound `extended-tabs` primitive, which requires an icon per tab, and there is no honest glyph for a resource kind - so a strip that filters by NAME alone needs the plain choice primitive instead.",
    },
    "dual-tabs-toolbar": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            leading: { leaf: "choice-tabs" },
            trailing: { leaf: "choice-tabs" },
        },
        why: "Two independent primary-tab axes govern one result set; they share a toolbar row but keep their own selection and accessible label without invented container chrome.",
    },
    "changelog-entry-row": {
        classes: ["flex", "w-full", "flex-col", "gap-3"],
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
    "question-answer-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            entry: { contract: "question-over-answer", repeats: true, restingCount: 4 },
        },
        why: "Recurring questions are peers of one joined list, so a full-width rule separates them and the list itself owns its first and last inset; written per entry instead, the rule after the final answer hangs under nothing and every entry has to remember it is the last one.",
    },
    "question-over-answer": {
        classes: ["flex", "w-full", "flex-col", "gap-2"],
        children: {
            question: { leaf: "text", props: { size: "sm", weight: "medium" } },
            answer: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "An answer means nothing except under the question it settles, so the two are one unit at the tighter seam a joined-list row uses rather than the wider seam that would let the answer drift toward the entry below it.",
    },
    "streak-week-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            day: { leaf: "day-cell", repeats: true, restingCount: 7 },
        },
        why: "Seven day cells form one fixed week run, so they move as one compact sequence rather than each caller rebuilding the row and its resting count.",
    },
    "progress-row-stack": {
        classes: ["flex", "flex-col", "gap-3"],
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
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            line: { contract: "label-with-muted-fact-row" },
            progress: { leaf: "progress" },
        },
        why: "The figure belongs to the label while the bar explains that pair, so the line stays directly above its measure.",
    },
    "labelled-fact-stack": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            fact: { contract: "label-value-row", repeats: true, restingCount: 4 },
        },
        why: "A column of label-and-figure lines reads as one object only while the space between them is smaller than the space around the whole run - at the section gap they stop being a set of facts about one thing and start looking like separate sections. `label-value-row` had no holder in the table at all until now, which is why a page wanting a fact sheet had nowhere legal to put one.",
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
    "claim-panel-grid": {
        classes: ["grid", "grid-cols-1", "gap-3", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: {
            claim: { contract: "attributed-claim-panel", repeats: true, restingCount: 4 },
        },
        why: "Short independent claims are compared rather than read in sequence, so they run one per line where there is no width to compare across and side by side where there is; a claim forced to span a full desktop measure stops being scannable and starts being a paragraph.",
    },
    "attributed-claim-panel": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            voice: { contract: "avatar-identity-rating-row", optional: true },
            claim: { leaf: "text" },
            note: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            proof: { leaf: "badge", optional: true },
        },
        why: "One surface holds exactly one claim, and the inset here is what keeps it off that surface's edge; the optional speaker above it and the optional proof chip below it are what turn the same sentence from an assertion the business makes into one a named person makes, and that is a difference in attribution rather than a different card.",
    },
    "captioned-cell-grid": {
        classes: ["grid", "grid-cols-2", "gap-6", "lg:grid-cols-3"],
        children: {
            cell: { contract: "subject-over-muted-caption", repeats: true, restingCount: 4 },
        },
        why: "Figures and photographs are scanned across rather than read down, so they keep two columns even on a phone where a claim panel goes single-file: a number alone on its own line reads as a headline instead of as one of four comparable measurements.",
    },
    "figure-beside-prose": {
        classes: ["grid", "grid-cols-1", "gap-6", "sm:grid-cols-2"],
        children: {
            figure: { leaf: "image-frame" },
            prose: { contract: ["instructor-credibility-column", "heading-body-action-stack"] },
        },
        why: "A picture and the words that earn trust from it are one statement read together, so they share a row once there is width and stack on a phone; which half comes first is the order the branch renders them in and not a second key, because image-left and image-right are the same relationship seen from either side.",
    },
    "instructor-credibility-column": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            identity: { contract: "subject-over-muted-caption" },
            bio: { leaf: "text", props: { tone: "muted" } },
            credentials: { contract: "credential-line-stack" },
            quote: { leaf: "pull-quote", optional: true },
        },
        why: "Credibility is read in one fixed order - who this is, what they have done, what they say - so the parts are named slots rather than a free stack: a biography arriving after the credential list reads as an afterthought, and the quote is optional because not every teacher has one worth printing.",
    },
    "credential-line-stack": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            credential: { leaf: "text", props: { size: "sm" }, repeats: true, restingCount: 3 },
        },
        why: "Credentials are an unordered set a reader skims for the one they recognise, so they sit tighter than any other stack on the page and their list marker belongs to this node rather than to a middot typed into the content string.",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-3"],
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
        classes: ["flex", "flex-col", "gap-3", "items-center", "text-center"],
        children: {
            mark: { leaf: "icon", optional: true },
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
        },
        why: "The supporting line sits under the title rather than beside it, because it explains the title rather than qualifying it - and both are centred so the pair reads as the surface's own name rather than as the first row of its content.",
    },
    "centred-heading-body-action": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "text-center"],
        children: {
            heading: { leaf: "heading", optional: true },
            body: { leaf: "text", optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "A closing call is the whole subject of its section rather than the first row of its content, so its three parts are centred together; all three are optional because an author may write a call with a heading and a button and no prose, and a reserved empty line is worse than a shorter stack.",
    },
    "heading-body-action-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            heading: { leaf: "heading", optional: true },
            body: { leaf: "text", optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "Beside a picture the same three parts read left, because centred prose in a half-width column leaves both of its edges ragged and stops looking like a paragraph at all.",
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
        why: "Controls repeat down one column as independently readable field or action units, so the ordinary gap-3 keeps each decision legible while their shared width still makes the run read as one form.",
    },
    "stacked-stat-rows": {
        classes: ["flex", "flex-col", "gap-0", "p-0", "[&>*]:w-full", "[&>*]:p-2"],
        children: {
            stat: { composite: "stat-row", repeats: true, restingCount: 3 },
        },
        why: "Standing figures read like peer select rows: no parent inset and no gap interrupt the scan, while every row owns p-2 so its icon, label and value share the same select-like element geometry as the list below.",
    },
    "profile-avatar-name-handle-disclosure-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-2", "py-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
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
        classes: ["flex", "flex-col", "items-center", "gap-3", "p-4", "text-center"],
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
