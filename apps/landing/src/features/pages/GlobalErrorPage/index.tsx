"use client"

import { readRouteFailureKind } from "@nivo/ui"
import { BOUNDARY_COPY } from "@/modules/landing/boundary"
import { GlobalErrorPageBase } from "./component"

/** Props for {@link GlobalErrorPage}: the failure and its retry callback. */
export type GlobalErrorPageProps = {
    readonly error: Error & { readonly digest?: string }
    readonly onRetry: () => void
}

/** A stale bundle is repaired by fetching the new document, which the boundary's in-place retry cannot do. */
const reloadDocument = () => window.location.reload()

/**
 * PAGE - the answer to a failure of the root layout.
 *
 * The layout owns the document, so this page brings its own grammar root and reads the same closed
 * copy the segment boundary reads.
 */
export const GlobalErrorPage = ({ error, onRetry }: GlobalErrorPageProps) =>
    readRouteFailureKind(error) === "stale-bundle"
        ? <GlobalErrorPageBase props={BOUNDARY_COPY.staleBundle} on={{ retry: reloadDocument }} />
        : <GlobalErrorPageBase props={BOUNDARY_COPY.unexpected} on={{ retry: onRetry }} />
