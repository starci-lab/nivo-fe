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

/** Draw one ordered step without knowing which product is progressing. */
export const LifecycleStep = ({ props, isLoading = false }: LifecycleStepProps) => (
    <Tree
        contract="ordinal-over-label-and-state"
        render={defineContractComponent("ordinal-over-label-and-state", {
            ordinal: defineLeafComponent("text", {}, () => (
                <Text props={{ content: props.ordinal, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
            label: defineLeafComponent("text", {}, () => (
                <Text props={{ content: props.label, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            state: defineLeafComponent("badge", {}, () => (
                <Badge
                    props={{
                        content: props.stateLabel,
                        tone: props.state === "done" ? "success" : props.state === "current" ? "accent" : "neutral",
                    }}
                    isLoading={isLoading}
                />
            )),
        })}
    />
)

/** Source-level tier marker for the reusable closed step composition. */
export const meta = { shape: "composite", world: "pure" } as const
