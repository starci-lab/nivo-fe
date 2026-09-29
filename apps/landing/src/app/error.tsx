"use client"

import { ErrorPage } from "@/features/pages/ErrorPage"

/** What Next hands a segment boundary: the failure and the callback that re-renders the segment. */
type ErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/** The `/[locale]` error boundary. It mounts one page and makes no drawing decision. */
const Error = ({ error, reset }: ErrorRouteProps) => <ErrorPage error={error} onRetry={reset} />

export default Error
