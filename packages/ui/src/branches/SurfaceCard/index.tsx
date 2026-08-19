import { Card } from "@heroui/react"
import { Tree } from "../Tree"
import { Heading } from "../../leaves/Heading"
import { Text } from "../../leaves/Text"
import { SeeMoreLink } from "../../leaves/SeeMoreLink"
import { CONTRACTS } from "../../contracts"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type ContractBranchProps,
} from "../../contracts/props"

/**
 * BRANCH - `SurfaceCard`: a named section, and the surface its content sits on.
 *
 * THE NAME IS HELD OUTSIDE THE SURFACE, which is the one decision the whole shape turns on. A
 * section whose content is ITSELF a set of cards - resume tiles, course rows - would otherwise draw
 * a card inside a card, and two nested insets read as a mistake rather than as a hierarchy. Holding
 * the label above means `frameless` can drop the inner surface without the label going with it.
 *
 * THIS IS WHY BRANCHES EXIST. `Tree` draws ONE node; a section is three - the column, the label
 * line, the surface - and nothing in the registry stacks nodes. Assembly is a branch's whole job.
 *
 * WHAT IT MAY CONTAIN, AND NOTHING ELSE: `Tree`, leaves, other branches. No markup of its own, no
 * class of its own. Every class on screen comes from a registry entry. That single sentence is
 * what stops a branch quietly becoming a second registry. The one class written here is `p-0`, and
 * it ADDS nothing - it removes the vendor card's own inset so that the only inset on screen is the
 * one the entry declares. A branch forbidden to write that would be forced to leave an undeclared
 * inset standing around every entry it grounds.
 *
 * THE END OF THE LABEL LINE HOLDS ONE THING OR NOTHING, and an action outranks a fact when both are
 * passed. They compete for the same place on purpose: a fact and a control that look alike, sitting
 * where each other would, is how a reader presses the count.
 *
 * `level` IS DECIDED HERE, ONCE. Three blocks each choosing a heading level by hand is how one of
 * them ends up different; the branch is the single place, now that contracts hold only classes.
 */

/** What this branch draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type SurfaceCardData = {
    /**
     * The already-resolved name of the section. Copy, so it never rests.
     *
     * ABSENT MEANS THE OBJECT SAYS WHAT IT IS. A claim panel, a course tile, an empty notice: their
     * own contents name them, and a heading above each one in a grid of them is a title repeated
     * until it stops being read. Without a label this draws the ground and nothing else - no label
     * line, no section node - which is the whole of what a second, label-less surface branch would
     * have been. One component with one optional name, rather than two components differing by a
     * line each.
     */
    readonly label?: string
    /**
     * A supporting fact at the end of the label line - a count, a record, a unit. Never an action:
     * it reads as part of the label sentence, and a control there gets pressed by somebody who
     * meant to read it. Dropped when {@link SurfaceCardData.seeMoreLabel} claims the same place.
     */
    readonly fact?: string
    /**
     * The already-resolved words of the way out of this section, drawn at the end of the label
     * line. Present only when `on.seeMore` is - a link that leads nowhere is worse than no link.
     */
    readonly seeMoreLabel?: string
    /**
     * Drop the inner surface and let the content sit straight under the label - for a section whose
     * content is ALREADY a set of surfaces. The label stays either way.
     */
    readonly isFrameless?: boolean
}

/** What the section reports. */
export type SurfaceCardActions = {
    /** Called when the reader follows the way out at the end of the label line. */
    readonly seeMore?: () => void
}

/** Props for {@link SurfaceCard}. Fixed slots plus what it assembles - see {@link BranchProps}. */
/**
 * The bodies a named section may hold, READ FROM THE ENTRY rather than restated here.
 *
 * A section holds what `label-row-over-card` says it holds. Typed as any key, this branch could be
 * handed a body its own entry refuses - and the refusal would surface as a type error deep inside
 * the projection, or not at all if somebody widened the projection to make the red go away. Derived,
 * the list has one author: adding a body to the entry admits it here in the same edit.
 */
export type SectionBodyKey = (typeof CONTRACTS)["label-row-over-card"]["children"]["body"]["contract"][number]

/** Props for {@link SurfaceCard}. Fixed slots plus what it assembles - see {@link ContractBranchProps}. */
export type SurfaceCardProps<K extends SectionBodyKey> = ContractBranchProps<K> & {
    /** Absent altogether when the object names itself: then this draws the ground and nothing else. */
    readonly props?: SurfaceCardData
    readonly on?: SurfaceCardActions
}

/**
 * Draw a named section.
 *
 * @param input - {@link SurfaceCardProps}
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
    const fact = props.fact === undefined
        ? null
        : <Text props={{ content: props.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />
    const end = hasSeeMore
        ? <SeeMoreLink props={{ label: props.seeMoreLabel }} on={{ press: on.seeMore }} />
        : fact

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
     * arms now differ in exactly one thing - the ground - which is what `isFrameless` claims to be.
     *
     * IT USED TO DIFFER IN MORE THAN THAT, INVISIBLY. Framed, the entry's classes and markers were
     * spread onto `Card.Content`, so the vendor kept the ELEMENT: an entry declaring `host: "ol"`
     * came out as a `div` and the list left the accessibility tree with nothing able to report it -
     * not the compiler, not the linter, not a screenshot. `Tree` is the only place that reads
     * `spec.host`, so the entry survives only by going through it.
     */
    const content = <Tree contract={contract} render={render} />

    /*
     * `p-0` IS THE BRANCH'S ONLY CLASS AND IT IS THE ABSENCE OF ONE. The vendor card carries its own
     * `p-4`; with the entry's node now INSIDE that card rather than painted onto it, the vendor inset
     * would sit outside the entry and become a second one nobody declared. Zeroing it hands the whole
     * interior to the entry - which is where an inset is readable, and where `SurfaceListCard`
     * already puts it.
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
                 * own contract rendered inside - so it enters the section as a projection. Handing
                 * the caller's key back as slots would open a second node around a node already
                 * drawn, which is the duplicate wrapper this branch was inset twice by.
                 */
                body: defineContractProjection(contract, () => surface),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "label-row-over-card", world: "pure" } as const
