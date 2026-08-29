import { Icon } from "../../leaves/Icon"
import { Text } from "../../leaves/Text"

/** Resolved task identity and completion state. */
export type TaskProgressRowData = { readonly id: string; readonly title?: string; readonly fact?: string; readonly isComplete?: boolean }
/** Props for one task progress row. */
export type TaskProgressRowProps = { readonly props: TaskProgressRowData; readonly isLoading?: boolean }

/** Render one read-only task row. */
export const TaskProgressRow = (props: TaskProgressRowProps) => (
    <div>
        <Icon props={{ name: props.props.isComplete === true ? "complete" : "pending", role: "leading" }} isLoading={props.isLoading} />
        <Text props={{ content: props.props.title }} isLoading={props.isLoading} />
        <Text props={{ content: props.props.fact, size: "xs" }} isLoading={props.isLoading} />
    </div>
)