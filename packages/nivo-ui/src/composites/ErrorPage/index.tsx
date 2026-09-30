import { readRouteFailureKind } from "../RouteStateView"
import { useTranslations } from "next-intl"
import { ErrorPageBase } from "./component"

/** Props for {@link ErrorPage}: the boundary failure and its retry callback. */
export type ErrorPageProps = {
    readonly error: Error & { readonly digest?: string }
    readonly onRetry: () => void
}

/** A stale bundle needs a document reload so the browser fetches the current assets. */
const reloadDocument = () => window.location.reload()

/** Render the translated answer to a route that failed while rendering. */
export const ErrorPage = ({ error, onRetry }: ErrorPageProps) => {
    const t = useTranslations("boundary.error")
    const isStaleBundle = readRouteFailureKind(error) === "stale-bundle"
    return (
        <ErrorPageBase
            props={
                isStaleBundle
                    ? {
                          message: t("staleBundle.message"),
                          description: t("staleBundle.description"),
                          actionLabel: t("reload"),
                      }
                    : {
                          message: t("unexpected.message"),
                          description: t("unexpected.description"),
                          actionLabel: t("retry"),
                      }
            }
            on={{ retry: isStaleBundle ? reloadDocument : onRetry }}
        />
    )
}
