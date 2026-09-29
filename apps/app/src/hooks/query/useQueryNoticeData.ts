import { useTranslations } from "next-intl"
import type { QueryNoticeViewData } from "@nivo/ui"
import type { NivoQueryFailure } from "@/modules/query"

/** The sign-in route a refused read sends its reader through. */
const SIGN_IN_HREF = "/authentication"

/** Phrase one settled failure into the atoms {@link QueryNoticeViewData} draws. */
export type QueryNoticeDataOf = (failure: NivoQueryFailure, retryPending?: boolean) => QueryNoticeViewData

/**
 * Resolve the query-failure copy once and hand back the function that phrases any failure.
 *
 * The kind selects the sentence, a phrased reason is kept beside it, and the answer's own `retryable`
 * decides whether a retry label is offered; a refused session names the sign-in door instead.
 *
 * @returns A function from a settled failure (and whether its retry is running) to the drawable atoms.
 */
export const useQueryNoticeData = (): QueryNoticeDataOf => {
    const t = useTranslations("console.query")
    return (failure, retryPending) => {
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
            return { message, description, signIn: { label: t("signIn"), href: SIGN_IN_HREF } }
        return { message, description, retryLabel: failure.retryable ? t("retry") : undefined, retryPending }
    }
}
