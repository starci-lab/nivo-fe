import { Card } from "@heroui/react"
import { Heading, Text } from "@nivo/ui"
import { SeeMoreLink } from "@nivo/ui/leaves/SeeMoreLink"
import { Tree } from "../Tree"
import { CONTRACTS } from "../../contracts"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type ContractBranchProps,
} from "../../contracts/props"

/**
 * BRANCH - `SurfaceCard`, the candidate's copy: a named section, and the surface its content sits on.
 *
 * TARGET PATH ON MATERIALIZATION: none. `packages/ui/src/branches/SurfaceCard/index.tsx` already is
 * this component. It is copied for the same mechanical reason `Tree` is - `SectionBodyKey` is read
 * off the shipped `label-row-over-card` entry, so the shipped branch cannot be handed
 * `body-with-refusal-note`, which is EXTEND 1 of this case and is required by two work items.
 *
 * THE LEAVES ARE NOT COPIED, and that distinction is what keeps this candidate honest: `Heading`,
 * `Text` and `SeeMoreLink` are imported from `@nivo/ui` unchanged, so every word on these screens is
 * set by the shipped typography rather than by anything written in this lab. Only the two files that
 * are generic over the contract key had to be reproduced.
 *
 * THE NAME IS HELD OUTSIDE THE SURFACE, which is the one decision the whole shape turns on. A section
 * whose content is ITSELF a set of cards would otherwise draw a card inside a card, and two nested
 * insets read as a mistake rather than as a hierarchy.
 *
 * THE END OF THE LABEL LINE HOLDS ONE THING OR NOTHING, and an action outranks a fact when both are
 * passed. They compete for the same place on purpose: a fact and a control that look alike, sitting
 * where each other would, is how a reader presses the count.
 *
 * `level` IS DECIDED HERE, ONCE - which is why the two overview sections that carry a bare sentence
 * instead of a ground have to name level 3 themselves rather than picking one of their own.
 */

/** What this branch draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type SurfaceCardData = {
    /** The already-resolved name of the section. Absent means the object says what it is. */
    readonly label?: string
    /**
     * A supporting fact at the end of the label line - a count, a record, a unit. Never an action:
     * it reads as part of the label sentence. Dropped when a way out claims the same place.
     */
    readonly fact?: string
    /** The already-resolved words of the way out. Present only when `on.seeMore` is. */
    readonly seeMoreLabel?: string
    /** Drop the inner surface for a section whose content is ALREADY a set of surfaces. */
    readonly isFrameless?: boolean
}

/** What the section reports. */
export type SurfaceCardActions = {
    /** Called when the reader follows the way out at the end of the label line. */
    readonly seeMore?: () => void
}

/**
 * The bodies a named section may hold, READ FROM THE ENTRY rather than restated here.
 *
 * Derived, the list has one author: admitting `body-with-refusal-note` in the table admits it here in
 * the same edit, which is precisely what EXTEND 1 claims and what the shipped branch cannot do.
 */
export type SectionBodyKey = (typeof CONTRACTS)["label-row-over-card"]["children"]["body"]["contract"][number]

/** Props for {@link SurfaceCard}. Fixed slots plus what it assembles - see {@link ContractBranchProps}. */
export type SurfaceCardProps<K extends SectionBodyKey> = ContractBranchProps<K> & {
    /** Absent altogether when the object names itself: then this draws the ground and nothing else. */
    readonly props?: SurfaceCardData
    /** What the section reports. */
    readonly on?: SurfaceCardActions
}

/**
 * Draw a named section.
 *
 * @param input - {@link SurfaceCardProps}
 * @returns The section, or the bare ground when it carries no name.
 */
export const SurfaceCard = <const K extends SectionBodyKey>({
    props = {},
    on,
    contract,
    render,
    isLoading = false,
}: SurfaceCardProps<K>) => {
    // One place at the end of the line: the way out wins it, the fact takes it only if free.
    const hasSeeMore = props.seeMoreLabel !== undefined && on?.seeMore !== undefined
    const end = hasSeeMore
        ? <SeeMoreLink props={{ label: props.seeMoreLabel }} on={{ press: on.seeMore }} />
        : props.fact === undefined
            ? null
            : <Text props={{ content: props.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />

    const labelContract = !hasSeeMore && props.fact !== undefined
        ? "title-with-baseline-fact"
        : "title-with-end-action"
    const title = defineLeafComponent("heading", {}, () => (
        <Heading props={{ content: props.label, level: 3 }} />
    ))
    const labelRow = labelContract === "title-with-baseline-fact"
        ? defineContractComponent("title-with-baseline-fact", {
            title,
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => end),
        })
        : defineContractComponent("title-with-end-action", {
            title,
            ...(hasSeeMore ? {
                end: defineLeafComponent("see-more-link", {}, () => end),
            } : {}),
        })

    /*
     * ONE NODE, DRAWN THE SAME WAY WHETHER OR NOT A CARD STANDS BEHIND IT. The framed and frameless
     * arms differ in exactly one thing - the ground - which is what `isFrameless` claims to be.
     * `Tree` is the only place that reads `spec.host`, so the entry survives only by going through it.
     */
    const content = <Tree contract={contract} render={render} />

    /*
     * `p-0` IS THE BRANCH'S ONLY CLASS AND IT IS THE ABSENCE OF ONE. The vendor card carries its own
     * inset; with the entry's node INSIDE that card, the vendor inset would sit outside the entry and
     * become a second one nobody declared.
     */
    const surface = props.isFrameless === true ? content : (
        <Card className="p-0">
            <Card.Content className="p-0" data-component="SurfaceCardBody">
                {content}
            </Card.Content>
        </Card>
    )

    // No name, no section: the column and the label line exist to hold a label, so an object that
    // names itself gets the ground alone rather than an empty row above it.
    if (props.label === undefined) return surface

    return (
        <Tree
            contract="label-row-over-card"
            render={defineContractComponent("label-row-over-card", {
                label: labelRow,
                /*
                 * The surface is ALREADY a whole node - the vendor card, its body, and the caller's
                 * own contract rendered inside - so it enters the section as a projection. Handing the
                 * caller's key back as slots would open a second node around a node already drawn.
                 */
                body: defineContractProjection(contract, () => surface),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "label-row-over-card", world: "pure" } as const
