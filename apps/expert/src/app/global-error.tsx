"use client"

import { usePathname } from "next/navigation"
import { GlobalErrorPage, readGlobalErrorLocale } from "@/features/pages/GlobalErrorPage"
import "./globals.css"

/** What Next hands the document-level boundary: the failure and the callback that re-renders the tree. */
type GlobalErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/**
 * The root boundary. It replaces the root layout, so it owns the document shell itself: the
 * stylesheet is imported here and the language comes from the address, not from a provider.
 */
const GlobalError = ({ error, reset }: GlobalErrorRouteProps) => {
    const locale = readGlobalErrorLocale(usePathname())
    return (
        <html lang={locale}>
            <body>
                <GlobalErrorPage error={error} locale={locale} onRetry={reset} />
            </body>
        </html>
    )
}

export default GlobalError
