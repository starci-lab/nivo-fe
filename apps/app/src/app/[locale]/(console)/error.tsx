"use client"

import { ErrorPage } from "@nivo/ui"

type ErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/** Keep console chrome around the shared answer when a console route fails. */
const Error = ({ error, reset }: ErrorRouteProps) => <ErrorPage error={error} onRetry={reset} />

export default Error
