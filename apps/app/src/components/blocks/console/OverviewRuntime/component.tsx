import { LoadingRegion } from "@/components/blocks/loading/LoadingRegion"
import { SurfaceCard, Text, type PresentationState } from "@starci/grammar/common"
import { OVERVIEW_RUNTIME_CELL_CLASS_NAME, OVERVIEW_RUNTIME_FACTS_CLASS_NAME } from "./classNames"

/** One field of the workspace pod's own status read. */
export type OverviewRuntimeFact = {
    readonly id: string
    readonly label: string
    readonly value: string
    /** Unresolved carrier: the same tree at rest, each leaf shown loading. */
    readonly isSkeleton?: boolean
}
/** Resolved pod facts and the card's own label and fact. */
type OverviewRuntimeViewProps = {
    readonly state?: PresentationState
    readonly props: {
        readonly label: string
        readonly fact?: string
        readonly facts: ReadonlyArray<OverviewRuntimeFact>
    }
}
type OverviewRuntimeProps = OverviewRuntimeViewProps

/** Draw the workspace pod's own status read as its own labelled surface, never a caption. */
export const OverviewRuntimeBase = (props: OverviewRuntimeProps) => {
    const { state, props: view } = props
    const { label, fact, facts } = view
    const isBusy = facts.some((item) => item.isSkeleton === true)
    const card = (
        <SurfaceCard label={label} fact={fact} state={state} composition="joined">
            <div
                className={OVERVIEW_RUNTIME_FACTS_CLASS_NAME}
                data-contract="BOUNDARY-1 BOUNDARY-3 BOUNDARY-4"
                data-overview-runtime-facts="true"
            >
                {facts.map((item) => (
                    <div
                        key={item.id}
                        className={OVERVIEW_RUNTIME_CELL_CLASS_NAME}
                        data-contract="GAP-1 PADDING-4 PADDING-3 FLOW-3"
                        data-cell="true"
                    >
                        <Text size="xs" tone="muted" isSkeleton={item.isSkeleton}>
                            {item.label}
                        </Text>
                        <Text size="sm" weight="semibold" isSkeleton={item.isSkeleton}>
                            {item.value}
                        </Text>
                    </div>
                ))}
            </div>
        </SurfaceCard>
    )
    return <LoadingRegion isBusy={isBusy}>{card}</LoadingRegion>
}

/** Registry identity for the pure overview runtime twin. */
