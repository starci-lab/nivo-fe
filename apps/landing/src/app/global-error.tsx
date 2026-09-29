"use client"

import { GlobalErrorPage } from "@/features/pages/GlobalErrorPage"
import "./globals.css"

/** What Next hands the document-level boundary: the failure and the callback that re-renders the tree. */
type GlobalErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/** The root boundary. It replaces the root layout, so it owns the document shell and the stylesheet itself. */
const GlobalError = ({ error, reset }: GlobalErrorRouteProps) => (
    <html lang="vi">
        <body>
            <GlobalErrorPage error={error} onRetry={reset} />
        </body>
    </html>
)

export default GlobalError
