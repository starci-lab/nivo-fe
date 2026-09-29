"use client"

import { ErrorPage } from "@/features/pages/ErrorPage"

/** What Next hands a segment boundary: the failure and the callback that re-renders the segment. */
type ErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/** The console error boundary: a failing page keeps the console chrome around it. */
const Error = ({ error, reset }: ErrorRouteProps) => <ErrorPage error={error} onRetry={reset} />

export default Error
