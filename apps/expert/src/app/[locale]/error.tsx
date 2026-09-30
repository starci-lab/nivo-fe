"use client"

import { ErrorPage } from "@nivo/ui"

type ErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/** Mount the shared answer for a failure in the locale segment. */
const Error = ({ error, reset }: ErrorRouteProps) => <ErrorPage error={error} onRetry={reset} />

export default Error
