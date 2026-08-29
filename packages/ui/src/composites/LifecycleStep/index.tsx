import { Badge } from "../../leaves/Badge"
import { Text } from "../../leaves/Text"

/** The settled lifecycle positions. */
export type LifecycleStepState = "done" | "current" | "upcoming"
/** Resolved copy and state for one lifecycle step. */
export type LifecycleStepData = { readonly ordinal: string; readonly label: string; readonly state: LifecycleStepState; readonly stateLabel: string }
/** Props for one lifecycle step. */
export type LifecycleStepProps = { readonly props: LifecycleStepData; readonly isLoading?: boolean }

const STATE_TONES: Readonly<Record<LifecycleStepState, "success" | "accent" | "neutral">> = { done: "success", current: "accent", upcoming: "neutral" }

/** Render one ordered lifecycle step. */
export const LifecycleStep = (props: LifecycleStepProps) => (
    <div>
        <Badge props={{ content: props.props.ordinal, tone: STATE_TONES[props.props.state] }} isLoading={props.isLoading} />
        <Text props={{ content: props.props.label, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
        <Text props={{ content: props.props.stateLabel, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
    </div>
)