"use client"

import { readRouteFailureKind } from "@nivo/ui"
import { useTranslations } from "next-intl"
import { ErrorPageBase } from "./component"

/** Props for {@link ErrorPage}: the boundary's failure and its own retry callback. */
export type ErrorPageProps = {
    readonly error: Error & { readonly digest?: string }
    readonly onRetry: () => void
}

/** A stale bundle is repaired by fetching the new document, which the boundary's in-place retry cannot do. */
const reloadDocument = () => window.location.reload()

/**
 * PAGE - the answer to a route that threw while rendering.
 *
 * The failure is folded into a closed kind and the copy is keyed by that kind, so the reader never
 * sees exception text and every failure has one translated message.
 */
export const ErrorPage = ({ error, onRetry }: ErrorPageProps) => {
    const t = useTranslations("boundary.error")
    if (readRouteFailureKind(error) === "stale-bundle") {
        return (
            <ErrorPageBase
                props={{
                    message: t("staleBundle.message"),
                    description: t("staleBundle.description"),
                    actionLabel: t("reload"),
                }}
                on={{ retry: reloadDocument }}
            />
        )
    }
    return (
        <ErrorPageBase
            props={{
                message: t("unexpected.message"),
                description: t("unexpected.description"),
                actionLabel: t("retry"),
            }}
            on={{ retry: onRetry }}
        />
    )
}
