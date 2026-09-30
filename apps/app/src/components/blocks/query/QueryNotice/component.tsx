import { QueryNoticeView, type QueryNoticeViewActions, type QueryNoticeViewData } from "@nivo/ui"

/** The re-read a retryable failure may take. Absent, no retry is offered. */
export type QueryNoticeActions = QueryNoticeViewActions

/** Props for {@link QueryNoticeBase}. */
type QueryNoticeBaseProps = {
    readonly props: QueryNoticeViewData
    readonly on?: QueryNoticeActions
}

/** The ONE drawing of a settled query failure: phrased copy, an optional sign-in door, an optional retry. */
export const QueryNoticeBase = (props: QueryNoticeBaseProps) => <QueryNoticeView props={props.props} on={props.on} />
