"use client"

import { useTranslations } from "next-intl"
import { Button, EmptyNotice } from "@starci/grammar/common"
import type { NivoQueryFailure } from "@/modules/query"

/** The sign-in route a refused read sends its reader through. */
const SIGN_IN_HREF = "/authentication"

/** The settled failure one query surface draws, and whether its retry is already running. */
export type QueryNoticeData = {
    readonly failure: NivoQueryFailure
    readonly retryPending?: boolean
}

/** The re-read a retryable failure may take. Absent - or unasked by the answer - no retry is offered. */
export type QueryNoticeActions = {
    readonly retry?: () => void
}

/** Props for {@link QueryNotice}. */
export type QueryNoticeProps = {
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
    const { failure, retryPending } = props.props
    const t = useTranslations("console.query")
    const message =
        failure.kind === "refused"
            ? t("signInRequired")
            : failure.kind === "forbidden"
              ? t("forbidden")
              : failure.kind === "not-found"
                ? t("notFound")
                : failure.kind === "invalid"
                  ? t("invalid")
                  : t("unavailable")
    /* A machine word is a code, not a sentence; only a phrased reason is worth drawing. */
    const description = failure.reason.includes(" ") ? failure.reason : undefined
    if (failure.kind === "refused")
        return (
            <>
                <EmptyNotice message={message} description={description} />
                <Button href={SIGN_IN_HREF} variant="secondary">
                    {t("signIn")}
                </Button>
            </>
        )
    return (
        <EmptyNotice
            message={message}
            description={description}
            actionLabel={failure.retryable && props.on?.retry !== undefined ? t("retry") : undefined}
            actionVariant="secondary"
            isActionPending={retryPending}
            onAction={props.on?.retry}
        />
    )
}
