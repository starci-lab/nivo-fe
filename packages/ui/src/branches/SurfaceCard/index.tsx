import { Tree } from "../Tree"
import { Text } from "../../leaves/Text"
import { SeeMoreLink } from "../../leaves/SeeMoreLink"
import { Button } from "../../leaves/Button"
import { CONTRACTS } from "../../contracts"
import { NivoCoreSurfaceCard as CoreSurfaceCard, type NivoCorePresentationState as PresentationState } from "../../contracts/grammar"
import {
    type ContractBranchProps,
    type ContractRenderComponent,
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
 * PRODUCT LAYOUT STILL COMES FROM `Tree`; reusable surface anatomy comes from Grammar Core. This
 * adapter renders the package-owned Core branch, then projects the product contract unchanged
 * inside it. The shared Core variable removes surface inset so the product contract remains the
 * sole owner of interior spacing.
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
    /** Accessible name used when the body names itself and no visible section label is needed. */
    readonly ariaLabel?: string
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
     * The already-resolved primary action at the end of the label line. It outranks both a
     * see-more link and a fact because the three compete for the same semantic end position.
     */
    readonly actionLabel?: string
    /**
     * Drop the inner surface and let the content sit straight under the label - for a section whose
     * content is ALREADY a set of surfaces. The label stays either way.
     */
    readonly isFrameless?: boolean
}

/** What the section reports. */
export type SurfaceCardActions = {
    /** Called when the reader starts the section's primary operation. */
    readonly act?: () => void
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
type BoundSurfaceCardProps<K extends SectionBodyKey> = ContractBranchProps<K> & {
    /** Absent altogether when the object names itself: then this draws the ground and nothing else. */
    readonly props?: SurfaceCardData
    readonly on?: SurfaceCardActions
}

type RuntimeSurfaceCardProps<K extends SectionBodyKey, P extends object> = {
    readonly contract: K
    readonly render: ContractRenderComponent<NoInfer<K>, P>
    readonly contentProps: P
    readonly props?: SurfaceCardData
    readonly on?: SurfaceCardActions
    readonly isLoading?: boolean
}

/** A bound contract or one runtime ComponentType whose own implementation opens the matching Tree. */
export type SurfaceCardProps<K extends SectionBodyKey, P extends object = never> =
    [P] extends [never] ? BoundSurfaceCardProps<K> : RuntimeSurfaceCardProps<K, P>

/**
 * Draw a named section.
 *
 * @param input - {@link SurfaceCardProps}
 */
export const SurfaceCard = <const K extends SectionBodyKey, P extends object = object>(
    input: BoundSurfaceCardProps<K> | RuntimeSurfaceCardProps<K, P>,
) => {
    const { props = {}, on, contract, isLoading = false } = input
    const presentationState: PresentationState = isLoading ? "pending" : "neutral"
    // One place at the end of the line: the way out wins it, the fact takes it only if free.
    const hasAction = props.actionLabel !== undefined && on?.act !== undefined
    const hasSeeMore = props.seeMoreLabel !== undefined && on?.seeMore !== undefined
    const fact = props.fact === undefined
        ? null
        : <Text props={{ content: props.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />
    let end = fact
    if (hasSeeMore) end = <SeeMoreLink props={{ label: props.seeMoreLabel, }} on={{ press: on.seeMore }} />
    if (hasAction) end = <Button props={{ label: props.actionLabel, size: "sm", variant: "primary" }} on={{ press: on.act }} />

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
    const identity = props.label === undefined
        ? { ariaLabel: props.ariaLabel ?? contract.replaceAll("-", " ") }
        : { label: props.label }

    let content = input.render.kind === "component" ? null : <Tree contract={contract} render={input.render} />
    if (input.render.kind === "component" && "contentProps" in input) {
        const Content = input.render
        content = <Content {...input.contentProps} />
    }

    return (
        <CoreSurfaceCard
            {...identity}
            frame={props.isFrameless === true ? "frameless" : "bounded"}
            labelEnd={end}
            scroll="page"
            state={presentationState}
        >
            <div data-component="SurfaceCardBody">
                {content}
            </div>
        </CoreSurfaceCard>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "label-row-over-card", world: "pure" } as const
