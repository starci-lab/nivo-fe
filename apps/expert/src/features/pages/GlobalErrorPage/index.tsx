"use client"

import { readRouteFailureKind } from "@nivo/ui"
import en from "@/messages/boundary/en.json"
import vi from "@/messages/boundary/vi.json"
import { toLocaleFromPathname, type Locale } from "@/modules/i18n/config"
import { GlobalErrorPageBase } from "./component"

/** Props for {@link GlobalErrorPage}: the failure, its retry callback and the locale read from the address. */
export type GlobalErrorPageProps = {
    readonly error: Error & { readonly digest?: string }
    readonly locale: Locale
    readonly onRetry: () => void
}

/** The locale of the address the failed layout was serving, for the one boundary that has no provider above it. */
export const readGlobalErrorLocale = (pathname: string | null): Locale => toLocaleFromPathname(pathname)

const COPY: Record<Locale, typeof en> = { en, vi }

/** A stale bundle is repaired by fetching the new document, which the boundary's in-place retry cannot do. */
const reloadDocument = () => window.location.reload()

/**
 * PAGE - the answer to a failure of the root layout.
 *
 * The layout owns the translation provider, so when it fails nothing above can hand copy down: the
 * copy is read from the catalogue's `boundary` namespace directly, keyed by the locale of the address.
 */
export const GlobalErrorPage = ({ error, locale, onRetry }: GlobalErrorPageProps) => {
    const copy = COPY[locale].error
    if (readRouteFailureKind(error) === "stale-bundle") {
        return <GlobalErrorPageBase props={{ message: copy.staleBundle.message, description: copy.staleBundle.description, actionLabel: copy.reload }} on={{ retry: reloadDocument }} />
    }
    return <GlobalErrorPageBase props={{ message: copy.unexpected.message, description: copy.unexpected.description, actionLabel: copy.retry }} on={{ retry: onRetry }} />
}
