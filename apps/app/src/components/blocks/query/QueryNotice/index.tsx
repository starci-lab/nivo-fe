"use client"

import { useQueryNoticeData } from "@/hooks/query"
import type { NivoQueryFailure } from "@/modules/query"
import { QueryNoticeBase, type QueryNoticeActions } from "./component"

/** The settled failure one query surface draws, and whether its retry is already running. */
type QueryNoticeData = {
    readonly failure: NivoQueryFailure
    readonly retryPending?: boolean
}

/** Props for {@link QueryNotice}. */
type QueryNoticeProps = {
    readonly props: QueryNoticeData
    readonly on?: QueryNoticeActions
}

/**
 * The ONE drawing of a settled query failure: the kind selects the sentence, a phrased reason is
 * shown beside it, and the answer's own `retryable` decides whether a retry is offered. A refused
 * session names the sign-in door - the query hook's session discard and the console's anonymous
 * redirect are what walks the reader through it.
 */
export const QueryNotice = (props: QueryNoticeProps) => {
    const noticeOf = useQueryNoticeData()
    const atoms = noticeOf(props.props.failure, props.props.retryPending)
    /* No re-read to offer means no retry to draw, whatever the answer allows. */
    return (
        <QueryNoticeBase
            props={props.on?.retry === undefined ? { ...atoms, retryLabel: undefined } : atoms}
            on={props.on}
        />
    )
}
