import {
    Badge,
    Button,
    Heading,
    SurfaceCard,
    Text,
    TextLink,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { FleetRow, type FleetStatus } from "@/components/blocks/provisioning/FleetRow"

/**
 * PAGE (drawing half) - the middle level, and the reason an academy is a ROW rather than a destination.
 *
 * WHY THIS LEVEL EXISTS ON DAY ONE, when the catalogue has exactly one template. It does three things
 * neither the overview nor a single-app page can: it puts every app built from the same template side
 * by side, it holds an app that is PAID FOR AND NOT YET BUILT, and it opens the catalogue. A
 * destination per template would force a fifth rail entry when template #2 ships, by which time its
 * address is a published one nobody can move.
 *
 * ONE ROW SHAPE IN BOTH SECTIONS, AND THAT IS THE ARGUMENT FOR THE CONTRACT EXTEND. The owned apps and
 * the catalogue share one joined surface, so a newcomer meets exactly the list they will come back to
 * for their second app. What differs is the RELATIONSHIP each row expresses, which is why the
 * catalogue row is its own key: a thing that can be bought carries a price and one press, a thing
 * already owned carries a lifecycle whose tone changes underneath it.
 *
 * THE ROW WITH NO BUTTON NEEDS NO NEW SHAPE. `identity-kind-status-action-row.action` is already
 * optional, and its own `why` states the reason verbatim: a resource mid-provision has nothing anybody
 * may do to it, and an always-present button drawn disabled promises a control that does not exist
 * rather than admitting there is none.
 *
 * NO COUNT. Neither section states how many apps or how many templates there are.
 *
 * IT RESOLVES NOTHING AND FORMATS NOTHING. Every word and every price arrives finished, because
 * `presentational-purity` refuses the translation runtime and the formatter alike in this half.
 */

/** One app the account owns, with every word already chosen. */
export type OwnedAppRow = {
    /** The row's identity, and its React key. */
    readonly id: string
    /** What the app is called. */
    readonly name: string
    /** The address a customer would type, or what an unbuilt order can say instead. */
    readonly detail: string
    /** Which template it was built from, or the generic word when the join found nothing. */
    readonly kindLabel: string
    /** How far it has got. Drives the tone `FleetRow` owns. */
    readonly status: FleetStatus
    /** That state in the reader's words. */
    readonly statusLabel: string
    /** The one thing this row's state permits, absent when it permits nothing. */
    readonly actionLabel?: string
}

/** One buyable template, with every word and every figure already chosen. */
export type TemplateOfferRowView = {
    /** The row's identity, and its React key. */
    readonly id: string
    /** Stable provisionable-app key carried by this catalogue item. */
    readonly templateKey: string
    /** What the seller calls the template. */
    readonly name: string
    /** The seller's own sentence about it. */
    readonly tagline: string
    /** The word for what kind of thing this is. */
    readonly kindLabel: string
    /** The cheapest rung, already formatted as money in the reader's locale. */
    readonly priceLabel: string
    /** The words on the one press an offer carries. */
    readonly actionLabel: string
    /** True when the catalogue can name the template but the backend cannot provision it yet. */
    readonly actionDisabled: boolean
}

/** The section holding the apps this account owns, in every situation the set can be in. */
export type OwnedSectionView =
    | { readonly phase: "resting", readonly label: string }
    | { readonly phase: "empty", readonly label: string, readonly note: string }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly rows: ReadonlyArray<OwnedAppRow>
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/** The section holding the catalogue, which is how a new app is started. */
export type CatalogueSectionView =
    | { readonly phase: "resting", readonly label: string, readonly fact: string }
    | { readonly phase: "empty", readonly label: string, readonly note: string }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly fact: string
        readonly offers: ReadonlyArray<TemplateOfferRowView>
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/** Props for {@link _AppsPage}. */
export interface AppsPageViewProps {
    /** The page's own name. */
    readonly title: string
    /** The sentence under the title, saying what an app is and why the set is open. */
    readonly lede: string
    /** The owned section's settled situation. */
    readonly owned: OwnedSectionView
    /** The catalogue section's settled situation. */
    readonly catalogue: CatalogueSectionView
    /** Start a new app from the selected template catalogue row. */
    readonly onBuildTemplate: (templateKey: string) => void
    /** Open one already provisioned Academy resource. */
    readonly onOpenOwnedApp: (siteId: string) => void
}

/**
 * One resting row, which is the real row asked to rest as itself.
 *
 * @param index - Which resting row this is, so the run has stable keys.
 * @returns The resting row, bound to the slot's composite identity.
 */
const restingRow = (index: number) => defineCompositeComponent("fleet-row", {}, () => (
    <FleetRow props={{ id: `resting-${index}`, kind: "site", kindLabel: "", status: "provisioning" }} isLoading />
))

/**
 * One app the account owns, or one order that has been paid for and is still being built.
 *
 * @param row - The already-worded row.
 * @returns The row, bound to the slot's composite identity.
 */
const ownedRow = (row: OwnedAppRow, onOpenOwnedApp: (siteId: string) => void) => defineCompositeComponent("fleet-row", {}, () => (
    <FleetRow
        props={{
            id: row.id,
            name: row.name,
            detail: row.detail,
            kind: "site",
            kindLabel: row.kindLabel,
            status: row.status,
            statusLabel: row.statusLabel,
            actionLabel: row.actionLabel,
        }}
        on={{ open: () => onOpenOwnedApp(row.id), act: () => onOpenOwnedApp(row.id) }}
    />
))

/**
 * One buyable template.
 *
 * KNOWN DUPLICATION, RECORDED RATHER THAN HIDDEN. The identical tree is written again in
 * `OverviewPage/component.tsx`, where the empty app set opens the same catalogue. Its home is a block
 * of its own - `components/blocks/console/TemplateOfferRow/` - and that path is outside this case's
 * approved write boundary, so the extraction is reported rather than taken.
 *
 * IT ASSERTS THE SHAPE AND REFUSES TO ASSERT A FIELD. The kind badge says a template app is what this
 * is; it does not claim WHICH template an existing site was built from, because that is reachable
 * only through the nullable `catalogOrder -> catalogItem` relation. Here it is the catalogue's own
 * row, so the product name is its own.
 *
 * @param row - The already-worded offer.
 * @returns The row, bound to the slot's composite identity.
 */
const offerRow = (row: TemplateOfferRowView, onBuildTemplate: (templateKey: string) => void) => defineCompositeComponent("template-offer-row", {}, () => (
    <Tree
        contract="template-offer-row"
        render={defineContractComponent("template-offer-row", {
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => (
                    <TextLink props={{ label: row.name, size: "sm" }} />
                )),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: row.tagline, size: "xs", tone: "muted" }} />
                )),
            }),
            kind: defineLeafComponent("badge", { tone: "neutral" }, () => (
                <Badge props={{ content: row.kindLabel, tone: "neutral" }} />
            )),
            price: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: row.priceLabel, size: "sm" }} />
            )),
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: row.actionLabel, size: "sm", variant: "primary", disabled: row.actionDisabled }} on={{ press: () => onBuildTemplate(row.templateKey) }} />
            )),
        })}
    />
))

/**
 * A section that says one sentence in the column its rows would have used.
 *
 * THE EMPTY SENTENCE CHANGES SUBJECT, and that is a decision rather than wording. Not "you have no
 * academy" but "there is no app yet": the first sentence ages the day template #2 ships, the second
 * does not.
 *
 * @param label - The section's name.
 * @param note - The sentence.
 * @returns The section, bound to its contract identity.
 */
const sentenceSection = (label: string, note: string) => defineContractComponent("label-row-over-card", {
    label: defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level: 3 }} />),
    }),
    body: defineLeafComponent("text", {}, () => (
        <Text props={{ content: note, size: "sm", tone: "muted" }} />
    )),
})

/**
 * A section whose subject was REFUSED rather than empty.
 *
 * @param label - The section's name.
 * @param note - The refusal, in the reader's words.
 * @returns The section, bound to its contract identity.
 */
const refusedSection = (label: string, note: string) => defineContractProjection("label-row-over-card", () => (
    <SurfaceCard
        props={{ label }}
        contract="body-with-refusal-note"
        render={defineContractComponent("body-with-refusal-note", {
            note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: note, size: "sm", tone: "muted" }} />
            )),
        })}
    />
))

/**
 * The app set, and how a new one is started.
 *
 * @param input - {@link AppsPageViewProps}
 * @returns The page node.
 */
export const _AppsPage = ({ title, lede, owned, catalogue, onBuildTemplate, onOpenOwnedApp }: AppsPageViewProps) => {
    /*
     * SECTION 1 - the apps this account owns, in every situation the set can be in.
     */
    const ownedSection = () => {
        if (owned.phase === "empty") {
            return sentenceSection(owned.label, owned.note)
        }
        if (owned.phase === "refused") {
            return refusedSection(owned.label, owned.note)
        }
        const isResting = owned.phase === "resting"
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: owned.label }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", {
                    resource: owned.phase === "answered"
                        ? owned.rows.map((row) => ownedRow(row, onOpenOwnedApp))
                        : [restingRow(1), restingRow(2), restingRow(3)],
                })}
                isLoading={isResting}
            />
        ))
    }

    /*
     * SECTION 2 - the catalogue. It is a LIST because `catalogItems` returns one, filtered to
     * `site_from_template` - not because a second template has been promised. Today the filter yields
     * exactly one, and template #2 appears here with no new screen, no new route and no change to the
     * rail.
     */
    const catalogueSection = () => {
        if (catalogue.phase === "empty") {
            return sentenceSection(catalogue.label, catalogue.note)
        }
        if (catalogue.phase === "refused") {
            return refusedSection(catalogue.label, catalogue.note)
        }
        const isResting = catalogue.phase === "resting"
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: catalogue.label, fact: catalogue.fact }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", {
                    resource: catalogue.phase === "answered"
                        ? catalogue.offers.map((offer) => offerRow(offer, onBuildTemplate))
                        : [restingRow(4)],
                })}
                isLoading={isResting}
            />
        ))
    }

    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />),
                }),
                /*
                 * THE LEDE IS WHAT `title-with-baseline-fact` CANNOT HOLD. A baseline fact is a short
                 * phrase beside a title; this is a sentence about what an app IS and why the set is
                 * open, which is the claim the whole middle level rests on.
                 */
                lede: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: lede, size: "sm", tone: "muted" }} />
                )),
                section: [ownedSection(), catalogueSection()],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "pure" } as const
