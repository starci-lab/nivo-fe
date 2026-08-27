import { Text } from "../../leaves/Text"
import { Button } from "../../leaves/Button"
import type { JoinedListContractKey } from "../../contracts"
import { NivoCoreSurfaceListCard as CoreSurfaceListCard } from "../../contracts/grammar"
import type {
    ContractRenderComponent,
    DataValue,
    LeafProps,
} from "../../contracts/props"

/** Copy and optional outcome drawn around a joined list surface. */
export type SurfaceListCardData = {
    readonly [key: string]: DataValue
    readonly label: string
    /** A supporting status or figure at the end of the list label line. */
    readonly fact?: string
    readonly description?: string
    readonly actionLabel?: string
    /** A list bounded inside another surface uses an outline, never a second elevation. */
    readonly isNested?: boolean
    /** The enclosing surface already names this list; keep the name as data without drawing it twice. */
    readonly isLabelHidden?: boolean
}

/** The optional whole-list action reported below the joined surface. */
export type SurfaceListCardActions = {
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
    readonly act?: () => void
}

/** Contract-bound props for the joined-list surface branch. */
export type SurfaceListCardProps<
    K extends JoinedListContractKey,
    D extends SurfaceListCardData,
    A extends SurfaceListCardActions = SurfaceListCardActions,
> = {
    readonly contract: K
    readonly render: ContractRenderComponent<NoInfer<K>, LeafProps<D, A>>
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

/**
 * Draw a labelled, joined list. The list contract owns the admitted row identity and count;
 * this branch owns only the label above it and the whole-list outcome below it.
 */
export const SurfaceListCard = <
    const K extends JoinedListContractKey,
    D extends SurfaceListCardData,
    A extends SurfaceListCardActions = SurfaceListCardActions,
>(input: SurfaceListCardProps<K, D, A>) => {
    const { props: surfaceProps, on, render: Content, isLoading = false } = input
    const labelEnd = surfaceProps.fact === undefined ? undefined : (
        <Text props={{ content: surfaceProps.fact, size: "xs", tone: "muted" }} isLoading={isLoading} />
    )

    // A whole-list action outranks the supporting sentence: only one of the two closes the surface.
    const showsAction = surfaceProps.actionLabel !== undefined && (isLoading || on?.act !== undefined)
    const description = surfaceProps.description === undefined ? null : (
        <Text props={{ content: surfaceProps.description, size: "xs", tone: "muted" }} isLoading={isLoading} />
    )

    return (
        <CoreSurfaceListCard
            depth={surfaceProps.isNested === true ? "nested" : "top"}
            footer={showsAction ? (
                <Button props={{ label: surfaceProps.actionLabel, size: "sm", variant: "primary" }} on={{ press: on?.act }} isLoading={isLoading} />
            ) : description ?? undefined}
            label={surfaceProps.label}
            labelEnd={labelEnd}
            labelHidden={surfaceProps.isLabelHidden === true}
            rowMode="interactive"
        >
            <div
                data-surface-context={surfaceProps.isNested === true ? "nested" : "page"}
            >
                <Content props={surfaceProps} on={on} isLoading={isLoading} />
            </div>
        </CoreSurfaceListCard>
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", world: "pure" } as const
