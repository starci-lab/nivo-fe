import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"

/** Resolved identity and optional onward action for one submitted request. */
export type RequestSummaryData = { readonly subject: string; readonly detail: string; readonly actionLabel?: string }
/** Action reported by the request summary. */
export type RequestSummaryActions = { readonly press?: () => void }
/** Props for the request summary. */
export type RequestSummaryProps = { readonly props: RequestSummaryData; readonly on?: RequestSummaryActions; readonly isLoading?: boolean }

/** Render a request subject, detail, and optional action. */
export const RequestSummary = (props: RequestSummaryProps) => (
    <div>
        <div>
            <Text props={{ content: props.props.subject, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
            <Text props={{ content: props.props.detail, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
        </div>
        {props.props.actionLabel === undefined ? null : <Button props={{ label: props.props.actionLabel, size: "sm", variant: "secondary" }} on={{ press: props.on?.press }} isLoading={props.isLoading} />}
    </div>
)