import { Badge } from "../../leaves/Badge"
import { Text } from "../../leaves/Text"
import { Tree } from "../../branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "../../contracts/props"

/** The three positions one step may occupy in a settled lifecycle. */
export type LifecycleStepState = "done" | "current" | "upcoming"

/** Resolved content for one lifecycle step. */
export type LifecycleStepData = {
    readonly ordinal: string
    readonly label: string
    readonly state: LifecycleStepState
    readonly stateLabel: string
}

/** Props for the closed lifecycle-step shape. */
export type LifecycleStepProps = CompositeProps<LifecycleStepData>

/**
 * How each step state reads as a badge tone.
 *
 * A TABLE RATHER THAN A CHAIN, so adding a fourth state is one line and a reader checking one
 * state reads one line.
 */
const STATE_TONES: Readonly<Record<LifecycleStepState, "success" | "accent" | "neutral">> = {
    done: "success",
    current: "accent",
    upcoming: "neutral",
}

/** Draw one ordered step without knowing which product is progressing. */
export const LifecycleStep = ({ props, isLoading = false }: LifecycleStepProps) => (
    <Tree
        contract="lifecycle-marker-over-label-and-state"
        render={defineContractComponent("lifecycle-marker-over-label-and-state", {
            marker: defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: props.ordinal, tone: STATE_TONES[props.state] }} isLoading={isLoading} />
            )),
            label: defineLeafComponent("text", {}, () => (
                <Text props={{ content: props.label, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            state: defineLeafComponent("text", {}, () => (
                <Text props={{ content: props.stateLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
        })}
    />
)

/** Source-level tier marker for the reusable closed step composition. */
export const meta = { shape: "composite", world: "pure" } as const
