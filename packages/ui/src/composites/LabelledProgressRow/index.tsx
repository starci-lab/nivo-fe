import { Progress } from "../../leaves/Progress"
import { Text } from "../../leaves/Text"

/** Resolved label and completion figure for a progress row. */
export type LabelledProgressRowData = { readonly id: string; readonly title?: string; readonly percent?: number; readonly percentText?: string }
/** Props for one labelled progress row. */
export type LabelledProgressRowProps = { readonly props: LabelledProgressRowData; readonly isLoading?: boolean }

/** Render a progress label, figure, and accessible bar. */
export const LabelledProgressRow = (props: LabelledProgressRowProps) => (
    <div>
        <div>
            <Text props={{ content: props.props.title, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
            <Text props={{ content: props.props.percentText, size: "xs" }} isLoading={props.isLoading} />
        </div>
        <Progress props={{ value: props.props.percent, label: props.props.title ?? "" }} isLoading={props.isLoading} />
    </div>
)