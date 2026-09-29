"use client"

import { readRouteFailureKind } from "@nivo/ui"
import { BOUNDARY_COPY } from "@/modules/landing/boundary"
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
 * The failure is folded into a closed kind and the copy is keyed by that kind, so the visitor never
 * sees exception text and every failure has one message.
 */
export const ErrorPage = ({ error, onRetry }: ErrorPageProps) =>
    readRouteFailureKind(error) === "stale-bundle"
        ? <ErrorPageBase props={BOUNDARY_COPY.staleBundle} on={{ retry: reloadDocument }} />
        : <ErrorPageBase props={BOUNDARY_COPY.unexpected} on={{ retry: onRetry }} />
