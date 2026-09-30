"use client"

import { GlobalErrorPage } from "@nivo/ui"
import type en from "@/messages/en.json"
import { toLocaleFromPathname } from "@/modules/i18n/config"
import { usePathname } from "next/navigation"
import "./globals.css"

type BoundaryCopy = (typeof en)["boundary"]

type GlobalErrorRouteProps = {
    readonly error: Error & { readonly digest?: string }
    readonly reset: () => void
}

/** Render the root-layout failure with the address locale and this app's lazy boundary catalogue. */
const GlobalError = ({ error, reset }: GlobalErrorRouteProps) => {
    const locale = toLocaleFromPathname(usePathname())
    const loadBoundaryCopy = async (): Promise<BoundaryCopy> => {
        const catalogue: { readonly default: { readonly boundary: BoundaryCopy } } = await import(
            `../messages/${locale}.json`
        )
        return catalogue.default.boundary
    }
    return (
        <html lang={locale}>
            <body>
                <GlobalErrorPage error={error} locale={locale} loadBoundaryCopy={loadBoundaryCopy} onRetry={reset} />
            </body>
        </html>
    )
}

export default GlobalError
